const {
  Value,
  Range,
  resetKeyGenerator,
} = require('slate');
const { default: Html } = require('slate-html-serializer');
const { JSDOM } = require('jsdom');

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
  constructor(socket) {
    this._socket = socket;
    this._ioSocket = socket.socket;

    this._listen();
  }

  /**
   * Listen for specific messages
   * @private
   */
  _listen() {
    [
      [MSG.DOCUMENT.APPLY_CODE, this._handleCodeApply],
    ].map(def => this._ioSocket.on(def[0], def[1].bind(this)));
  }


  /**
   * Handle applying code (creating coding)
   * @private
   * @arg {object} data - object with at least four keys:
   *                      {string} documentId - ID of the document to modify
   *                      {object} range - Serialization of Slate.Range that
   *                                       should receive the coding
   *                      {object} mark - Serialization of Slate.Mark that
   *                                      should be applied to the range
   *                      {object} code - the code that should be applied
   * @arg {function} ack - acknowledge function for response
   */
  _handleCodeApply(data, ack) {
    const {
      documentId,
      projectId,
      projectType,
      range,
      mark,
      code,
    } = data;

    this._socket.api.request('documents.getTextDocument', {
      id: projectId,
      projectType: projectType,
    }).then(resp => {
      if (resp.code) {
        return Promise.reject(resp);
      } else {
        const doc = (resp.items || []).filter(doc => doc.id == documentId)[0];
        return Promise.resolve(doc);
      }
    }).then(doc => {
      resetKeyGenerator();

      const change = serializer.deserialize(doc.text.value).change();
      change.addMarkAtRange(Range.create(range), mark);
      doc.text = serializer.serialize(change.value)
        .replace(/(<coding[^>]+?)data-code-id=/g, '$1code_id=')
        .replace(/(<coding[^>]+?)data-author=/g, '$1author=');

      return this._socket.api.request('documents.applyCode', {
        resource: {
          textDocument: doc,
          code: code,
        },
      });
    }).then(resp => {
      ack('ok');

      // TODO emit sync event with operations to all
      // TODO emit syncError event to all clients if anything went wrong

    }).catch(err => {
      console.log('error in handle doc', err);
      ack('err', err);
    });

  }
}

module.exports = DocumentHandler;
