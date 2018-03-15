const {
  Range,
  resetKeyGenerator,
} = require('slate');
const { default: Html } = require('slate-html-serializer');
const { JSDOM } = require('jsdom');

const DocumentCache = require('../utils/DocumentCache');
const DocumentLock = require('../utils/DocumentLock');
const delay = require('../utils/delay');

const { MSG, EVT } = require('./constants');
const slateRules = require('./documentSerializationRules');

const serializer = new Html({
  rules: slateRules,
  parseHtml: html => new JSDOM(html).window.document.body
});


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
    ].map(def => this._ioSocket.on(def[0], def[1].bind(this)));
  }

  /**
   * @private
   * @arg {object} data - object with at least four keys:
   *                      {string} documentId - ID of the document to modify
   *                      {string} projectId - ID of the project to modify
   *                      {string} projectType - Type of the project to modify
   *                      {object[]} operations - Serializations of the
   *                                              Slate.Operations to apply
   *                      {object} code - Code to apply
   * @arg {function} ack - acknowledge function for response
   */
  async _handleCodingAdd(data, ack) {
    const {
      documentId,
      projectId,
      projectType,
      operations,
      code,
    } = data;

    // Initialize document lock manager and document cache
    const documentLock = new DocumentLock(this._redis, documentId);
    const cache = new DocumentCache(this._redis);

    try {
      // Wait up to 5 seconds for the exclusive lock on that document
      try {
        await documentLock.acquire(5000);
      } catch(e) {
        throw 'Could not get document lock';
      }

      // Try to read document from cache and fallback to backend
      let doc;
      try {
        doc = await cache.get(documentId);
      } catch(e) {

        // Load text document from backend
        const documentResponse = await this._socket.api.request('documents.getTextDocument', {
          id: projectId,
          projectType: projectType,
        });

        // Error, fail early
        if (documentResponse.code) {
          throw documentResponse;
        }

        // Extract document HTML from response
        doc = (documentResponse.items || []).filter(doc => doc.id == documentId)[0];

        // Assert consistent internal slate IDs
        resetKeyGenerator();

        doc.value = serializer.deserialize(doc.text.value);
      }

      // Apply operations to document
      doc = this._applyOperations(doc, operations);

      // Cache updated document
      try {
        await cache.store(documentId, doc);
      } catch(e) {
        // silently fail
      }

      // Serialize back to html
      doc.text = serializer.serialize(doc.value)
        .replace(/(<coding[^>]+?)data-code-id=/g, '$1code_id=')
        .replace(/(<coding[^>]+?)data-author=/g, '$1author=');

      // Refresh lock before saving changes
      try {
        await documentLock.refresh();
      } catch(error) {
        throw 'Document lock expired before uploading changes';
      }

      delete doc.value;
      // Transmit change to backend
      const codingResponse = await this._socket.api.request('documents.applyCode', {
        resource: {
          textDocument: doc,
          code: code,
        },
      });

      // Release lock
      documentLock.release();

      // Respond to sender and emit sync event
      const data = {
        authorSocket: this._ioSocket.id,
        document: documentId,
        operations,
      };
      this._socket.handleApiResponse(EVT.CODING.ADDED, ack, data);

    } catch(err) {
      documentLock.release();
      console.log('error in handle doc', err);
      ack('err', err);
    };

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
}

module.exports = DocumentHandler;
