const logger = require('../utils/Logger');
const { MSG, EVT } = require('./constants.js');

/**
 * Handler for all messages regarding codes endpoint
 */
class CodesHandler {
  /**
   * CodesHandler constructor
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
      [MSG.CODE.INSERT, this._handleCodeInsert],
      [MSG.CODE.RELOCATE, this._handleCodeRelocate],
      [MSG.CODE.REMOVE, this._handleCodeRemove],
      [MSG.CODE.UPDATE, this._handleCodeUpdate],
    ].map(def => this._ioSocket.on(def[0], def[1].bind(this)));
  }

  /**
   * Handle code insertion
   * @private
   * @arg {object} data - object with at least two keys:
   *                      {object} resource - describing the code to insert
   *                      {string} parentId - the ID of the parent code
   * @arg {function} ack - acknowledge function for response
   */
  _handleCodeInsert(data, ack) {
    logger.debug(`${this._ioSocket.id} code.insert ${JSON.stringify(data)}`);

    // Call backend API to insert code
    this._socket.api
      .request('codes.insertCode', data)
      .then(res => this._socket.handleApiResponse(EVT.CODE.INSERTED, ack, res))
      .catch((...foo) => ack('error', ...foo));
  }

  /**
   * Handle code relocation
   * @private
   * @arg {object} data - object with at least two keys:
   *                      {string} codeId - ID of Code to be relocated
   *                      {string} newParentID - ID of Code's new parent
   * @arg {function} ack - acknowledge function for response
   */
  _handleCodeRelocate(data, ack) {
    logger.debug(`${this._ioSocket.id} code.relocate ${JSON.stringify(data)}`);

    // Call backend API to relocate code
    this._socket.api
      .request('codes.relocateCode', data)
      .then(res => this._socket.handleApiResponse(EVT.CODE.RELOCATED, ack, res))
      .catch((...foo) => ack('error', ...foo));
  }

  /**
   * Handle code removal
   * @arg {object} data - object with at least one key:
   *                      {string} id - ID of Code to be removed
   * @arg {function} ack - acknowledge function for response
   */
  _handleCodeRemove(data, ack) {
    logger.debug(`${this._ioSocket.id} code.remove ${JSON.stringify(data)}`);

    // Call backend API to remove code
    this._socket.api
      .request('codes.removeCode', data)
      .then(res => this._socket.handleApiResponse(EVT.CODE.REMOVED, ack, data))
      .catch((...foo) => ack('error', ...foo));
  }

  /**
   * Handle code update
   * @private
   * @arg {object} data - object with at least one key:
   *                      {object} resource - describing the code to be updated
   * @arg {function} ack - acknowledge function for response
   */
  _handleCodeUpdate(data, ack) {
    logger.debug(`${this._ioSocket.id} code.update ${JSON.stringify(data)}`);

    // Call backend API to insert code
    this._socket.api
      .request('codes.updateCode', data)
      .then(res => this._socket.handleApiResponse(EVT.CODE.UPDATED, ack, res))
      .catch((...foo) => ack('error', ...foo));
  }
}

module.exports = CodesHandler;
