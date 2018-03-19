import { MSG, EVT } from './constants.js';

export default class DocumentService {
	constructor(syncService, socket) {
		this.syncService = syncService;

		// Bind public methods to this
		this.addCoding = this.addCoding.bind(this);
		this.removeCoding = this.removeCoding.bind(this);

		// Initialize listeners
		[
			[EVT.CODING.ADDED, this._handleCodingAdded],
			[EVT.CODING.REMOVED, this._handleCodingRemoved],
		].map(def => socket.on(def[0], def[1].bind(this)));
	}

	/**
	 * Apply code to document
	 *
	 * @access public
	 * @arg {string} documentId - ID of the document to apply the coding
	 * @arg {object[]} operations - List of Slate.Operations to apply
	 * @arg {object} code - Code that should be applied.
	 * @return {Promise}
	 */
	addCoding(documentId, operations, code) {
		return this.syncService.emit(MSG.CODING.ADD, {
			documentId,
			operations,
			code,
		});
	}

	/**
	 * Remove coding from document
	 *
	 * @access public
	 * @arg {string} documentId - ID of the document to apply the coding
	 * @arg {object[]} paths - Slate paths at which to remove the code
	 * @arg {string} codeId - ID of the Code to remove
	 * @return {Promise}
	 */
	removeCoding(documentId, paths, codeId) {
		return this.syncService.emit(MSG.CODING.REMOVE, {
			documentId,
			paths,
			codeId,
		});
	}

	/**
	 * Handle CODING.ADDED message from sync service. Used to notify
	 * clients about Codings being added to a document.
	 *
	 * @access private
	 * @arg {object} data - Object describing the change. At least contains:
	 *                      {string} authorSocket - Socket id of the author's
	 *                      {string} document - Document id to apply to
	 *                      {object[]} operations - Slate.Operations to apply
	 */
	_handleCodingAdded(data) {
		// Filter events that were initiated by this same client
		if (data.authorSocket !== this.syncService.getSocketId()) {
			this.syncService.fireEvent(EVT.CODING.ADDED, data);
		}
	}

	/**
	 * Handle CODING.REMOVED message from sync service. Used to notify
	 * clients about Codings being removed from a document.
	 *
	 * @access private
	 * @arg {object} data - Object describing the change. At least contains:
	 *                      {string} document - Document id to apply to
	 *                      {object[]} operations - Slate.Operations to apply
	 */
	_handleCodingRemoved(data) {
		this.syncService.fireEvent(EVT.CODING.REMOVED, data);
	}
}
