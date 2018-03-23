const {
  Range,
} = require('slate');
const logger = require('../utils/Logger');
const DocumentCache = require('../utils/DocumentCache');
const DocumentLock = require('../utils/DocumentLock');
const delay = require('../utils/delay');
const SlateUtils = require('../utils/SlateUtils');

const { MSG, EVT } = require('./constants');
const slateRules = require('./documentSerializationRules');


/**
 * Handler for all messages regarding documents endpoint
 */
class DocumentHandler {
  /**
   * DocumentHandler constructor
   * @public
   * @arg {Socket} socket - Instance of the socket on which events this Handler
   *                        should listen.
   */
  constructor(socket, redis) {
    this._socket = socket;
    this._ioSocket = socket.socket;
    this._redis = redis;

    this._listen();
  }

  /**
   * Listen for specific messages
   * @private
   */
  _listen() {
    [
      [MSG.CODING.ADD, this._handleCodingAdd],
      [MSG.CODING.REMOVE, this._handleCodingRemove],
    ].map(def => this._ioSocket.on(def[0], def[1].bind(this)));
  }

  /**
   * @private
   * @arg {object} data - object with required properties:
   *                      {string} documentId - ID of the document to modify
   *                      {object[]} operations - Serializations of the
   *                                              Slate.Operations to apply
   *                      {object} code - Code to apply
   * @arg {function} ack - acknowledge function for response
   */
  async _handleCodingAdd(data, ack) {
    const {
      documentId,
      operations,
      code,
    } = data;

    // Initialize document lock manager and document cache
    const apiHost = this._socket.api.apiHost;
    const lock = new DocumentLock(this._redis, apiHost, documentId);
    const cache = new DocumentCache(this._redis, apiHost, documentId);

    try {

      // Get the lock on the document and the document from cache or backend
      let doc = await this._lockAndGet(documentId, cache, lock);

      // Apply operations to document
      doc = this._applyOperations(doc, operations);

      // Cache document, refresh lock and upload to backend
      await this._cacheAndUpload(doc, cache, lock);

      // Release lock
      lock.release();

      // Respond to sender and emit sync event
      this._socket.handleApiResponse(EVT.CODING.ADDED, ack, {
        authorSocket: this._ioSocket.id,
        document: documentId,
        operations,
      });

    } catch(err) {
      lock.release();
      logger.error('Error in handle doc:', err);
      ack('err', err);
    }

  }

  /**
   * @private
   * @arg {object} data - object with required properties:
   *                      {string} documentId - ID of the document to modify
   *                      {object[]} pathRange - Required properties:
   *                                             {number[]} anchorPath
   *                                             {number} anchorOffset
   *                                             {number[]} focusPath
   *                                             {number} focusOffset
   *                      {number} codeId - ID of the code to remove
   * @arg {function} ack - acknowledge function for response
   */
  async _handleCodingRemove(data, ack) {
    const {
      documentId,
      pathRange,
      codeId,
    } = data;

    // Initialize document lock manager and document cache
    const apiHost = this._socket.api.apiHost;
    const lock = new DocumentLock(this._redis, apiHost, documentId);
    const cache = new DocumentCache(this._redis, apiHost, documentId);

    try {

      // Get the lock on the document and the document from cache or backend
      let doc = await this._lockAndGet(documentId, cache, lock);

      // Calculate the necessary operations including coding splitting
      const operations = await this._calculateCodingRemovalOperations(
        doc, pathRange, codeId);

      // Apply operations to document
      doc = this._applyOperations(doc, operations);

      // Cache document, refresh lock and upload to backend
      await this._cacheAndUpload(doc, cache, lock);

      // Release lock
      lock.release();

      // Respond to sender and emit sync event
      this._socket.handleApiResponse(EVT.CODING.REMOVED, ack, {
        document: documentId,
        operations,
      });

    } catch(err) {
      lock.release();
      logger.error('Error in coding remove', err);
      ack('err', err);
    }

  }

  /**
   * Get document from Backend and deserialize it
   *
   * @private
   * @arg {string} documentId - ID of the document to modify
   * @return {Promise} resolves with document object or rejects with message
   * @throws {string} API response, if backend returned error or 'No documents
   *                  received from backend' or 'No document found for ID ...'
   */
  async _fetchDocument(documentId) {
    // Load text documents from backend
    const documentsResponse = await this._socket.api
      .request('documents.getTextDocument', {
        id: this._socket.project.id,
        projectType: this._socket.project.type,
      });

    // Error, if API response has property 'code'
    if (documentsResponse.code) {
      throw documentsResponse;
    }

    // Error, if no documents array found
    if (!Array.isArray(documentsResponse.items)) {
      throw 'No documents received from backend';
    }

    // Extract document HTML from response
    const doc = documentsResponse.items.find(doc => doc.id == documentId);

    // Error, if no document found
    if (typeof doc === 'undefined') {
      throw `No document found for ID ${documentId}`;
    }

    // Deserialize document text and add to document object
    doc.value = SlateUtils.deserialize(doc.text.value);

    return doc;
  }

  /**
   * Try to get the mutex lock on the document, try to fetch it from the cache
   * or on cache miss from the backend
   *
   * @arg {string} documentId - ID of the document to retrieve
   * @arg {DocumentCache} cache - The cache instance to use
   * @arg {DocumentLock} lock - The lock instance to use
   * @throws {string} If any step fails
   */
  async _lockAndGet(documentId, cache, lock) {
    // Wait up to 5 seconds for the exclusive lock on that document
    try {
      await lock.acquire(5000);
    } catch(e) {
      logger.error('Error while trying to acquire document lock', e);
      throw 'Could not get document lock';
    }

    // Try to read document from cache and fallback to backend
    let doc;
    try {
      doc = await cache.get();
    } catch(e) {
      if (e !== 'cache miss') {
        logger.error('Error while trying to get document from cache', e);
      }

      try {
        doc = await this._fetchDocument(documentId);
      } catch(e) {
        logger.error('Error while trying to get document from backend', e);
        throw 'Could not get document from backend';
      }
    }

    return doc;
  }

  /**
   * Cache the document, refresh the lock on the document and upload it to the
   * backend
   *
   * @private
   * @arg {object} doc - Document to process
   * @arg {DocumentCache} cache - The cache instance to use
   * @arg {DocumentLock} lock - The lock instance to use
   * @throws {string} If any step fails
   */
  async _cacheAndUpload(doc, cache, lock) {
    // Cache document
    try {
      await cache.store(doc);
    } catch(e) {
      logger.error('Error while trying to cache document', e);
    }

    // Refresh lock before saving changes
    try {
      await lock.refresh();
    } catch(e) {
      logger.error('Error while trying to refresh document lock', e);
      throw 'Document lock expired before uploading changes';
    }

    // Call backend to persist changes
    try {
      await this._uploadDocumentToBackend(doc);
    } catch(e) {
      logger.error('Error while uploading document to Backend', e);
      throw 'Error while uploading changes to backend';
    }
  }

  /**
   * Serialize document and call applyCode endpoint at Backend
   *
   * @private
   * @arg {object} doc - Document to upload
   * @arg {object} code - Regarding code
   * @return {Promise} resolves with document object or rejects api response
   */
  _applyCodeAtBackend(doc, code) {

    // Serialize back to html
    doc.text = SlateUtils.serialize(doc.value);

    // Delete the deserialized value before uploading
    delete doc.value;

    // Transmit document to backend
    return this._socket.api.request('documents.applyCode', {
      resource: {
        textDocument: doc,
        code: code,
      },
    });
  }

  /**
   * Upload text document to Backend
   *
   * @private
   * @arg {object} doc - Document to upload
   * @return {Promise} resolves with document object or rejects api response
   */
  _uploadDocumentToBackend(doc) {

    // Serialize back to html
    doc.text = SlateUtils.serialize(doc.value);

    // Delete the deserialized value before uploading
    delete doc.value;

    // Transmit document to backend
    return this._socket.api.request('documents.updateTextDocument', {
      resource: doc,
    });
  }

  /**
   * Apply operations to document
   *
   * @private
   * @arg {object} document - Document to apply the operations to
   * @arg {object[]|Slate.Operation[]} operations - Operations to apply
   * @return {object} Document with updated value
   */
  _applyOperations(document, operations) {
    const change = document.value.change();
    operations.map(operation => change.applyOperation(operation));
    document.value = change.value;
    return document;
  }


  /**
   * Calculate all operations that are necessary for removing a coding,
   * including coding splitting if necessary.
   *
   * @private
   * @arg {string} doc - Document to operate on
   * @arg {object[]} pathRange - Range to work on. Required path properties:
   *                             {number[]} anchorPath
   *                             {number} anchorOffset
   *                             {number[]} focusPath
   *                             {number} focusOffset
   * @arg {string} codeId - ID of the code to remove
   * @return {Promise} - Waits for all code removals and splittings to be
   *                     successfully processed. Resolves with the editors
   *                     current content as HTML. Rejects if there is an
   *                     error while fetching a new coding ID from the API
   *                     or if nothing is selected
   */
  async _calculateCodingRemovalOperations(doc, pathRange, codeId) {

    const slateValue = doc.value;
    const document = slateValue.document;
    const range = SlateUtils.pathRangeToRange(slateValue, pathRange);

    // Find codings that should be removed
    const codingsToRemove = document.getMarksAtRange(range)
        .filter(mark => mark.type === 'coding')
        .filter(mark => mark.data.get('code_id') === codeId)
        .toArray();

    // Calculate parameters for code splitting if necessary.
    const splittingPromises = codingsToRemove.map(coding => {

      // Create curried coding searchers
      const findCodingStart = SlateUtils.findCodingStart.bind(
        this,
        coding.data.get('id')
      );
      const findCodingEnd = SlateUtils.findCodingEnd.bind(
        this,
        coding.data.get('id')
      );

      // Prepare return value
      const changeParameters = {
        oldCoding: coding,
      };

      // Get immediate character before the selection
      let prevChar;
      // Case 1: selection starts at block start
      if (range.startOffset === 0) {
        // Get previous text block
        const prevText = document.getPreviousText(range.startKey);

        // If there is no previous block, no splitting is needed
        if (typeof prevText === 'undefined') {
          return changeParameters;
        }

        prevChar = prevText.characters.last();
      } else {
        prevChar = document
          .getDescendant(range.startKey)
          .characters.get(range.startOffset - 1);
      }

      // If previous block is empty, no splitting is needed
      if (typeof prevChar === 'undefined') {
        return changeParameters;
      }

      // If character before selection has not the current coding,
      // no splitting is needed
      if (!prevChar.marks.find(m => m.equals(coding))) {
        return changeParameters;
      }

      // Search for the next character after the selection that has
      // not the current coding

      // Start with Text node in which the selection ends
      let textNode = document.getDescendant(range.endKey);

      // First textNode is only iterated after end of selection
      const characters = textNode.characters.slice(
        range.endOffset
      );

      // Find first character that has not the current coding
      let endOffset = findCodingEnd(characters);

      // If the immediate next character has not the current coding,
      // no splitting is needed
      if (endOffset === 0) {
        return changeParameters;
      }

      // If other character found, add the selection end offset to
      // get correct character offset in Text node
      if (typeof endOffset !== 'undefined') {
        endOffset += range.endOffset;
      }

      // If not already found, search subsequent Text nodes
      while (typeof endOffset === 'undefined') {
        textNode = document.getNextText(textNode.key);

        // No Text node left, coding is applied until document end
        if (!textNode) {
          textNode = document.getLastText();
          endOffset = textNode.characters.size;
          break;
        }

        // Find first character that has not the current coding
        endOffset = findCodingEnd(textNode.characters);
      }

      // Get new coding id from API
      return this._socket.api.request('project.incrCodingId', {
        id: this._socket.project.id,
        type: this._socket.project.type,
      }).then(
        ({ maxCodingID }) => {
          // Return parameters for coding removal and splitting
          // to have all changes atomically
          return {
            rangeToChange: Range.create({
              anchorKey: range.endKey,
              anchorOffset: range.endOffset,
              focusKey: textNode.key,
              focusOffset: endOffset
            }),
            oldCoding: coding,
            newCoding: {
              object: 'mark',
              type: 'coding',
              data: coding.data.set('id', maxCodingID)
            }
          };
        }
      );
    });

    // Wait for all splittings to resolve
    let parameters;
    try {
      parameters = await Promise.all(splittingPromises);
    } catch(e) {
      logger.error('error while fetching next coding ID', e);
      return;
    }

    // Build operations from parameters
    return parameters.reduce((operations, params) => {

      // Create operation for removing old coding
      operations = SlateUtils
        .rangeToPaths(slateValue, range)
        .reduce((operations, { path, offset, length }) => {
          return operations.concat({
            object: 'operation',
            type: 'remove_mark',
            mark: params.oldCoding,
            path,
            offset,
            length,
          });
        }, operations);

      // Perform operations for code splitting, if necessary
      if (params.rangeToChange) {
        // Create operation for removing coding with old id
        operations = SlateUtils
          .rangeToPaths(slateValue, params.rangeToChange)
          .reduce((operations, { path, offset, length }) => {
            return operations
              .concat({
                object: 'operation',
                type: 'remove_mark',
                mark: params.oldCoding,
                path,
                offset,
                length,
              })
              .concat({
                object: 'operation',
                type: 'add_mark',
                mark: params.newCoding,
                path,
                offset,
                length,
              });
          }, operations);
      }

      return operations;
    }, []);
  }
}

module.exports = DocumentHandler;
