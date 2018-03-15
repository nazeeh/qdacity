import { MSG, EVT } from './constants.js';

export default class DocumentService {
	constructor(syncService, socket) {
		this.syncService = syncService;

		// Bind public methods to this
		this.applyCode = this.applyCode.bind(this);

		// Initialize listeners
		[
			[EVT.DOCUMENT.CODE_APPLIED, this._handleCodeApplied],
		].map(def => socket.on(def[0], def[1].bind(this)));
	}

	/**
	 * Apply code to document
	 *
	 * @access public
	 * @arg {string} documentId - ID of the document to apply the coding
	 * @arg {string} projectId - ID of the current project
	 * @arg {string} projectType - The current project
	 * @arg {object[]} operations - List of Slate.Operations to apply
	 * @arg {object} code - Code that should be applied.
	 * @return {Promise}
	 */
	applyCode(documentId, projectId, projectType, operations, code) {
		return this.syncService.emit(MSG.DOCUMENT.APPLY_CODE, {
			documentId,
			projectId,
			projectType,
			operations,
			code,
		});
	}

	/**
	 * Handle document.codeApplied message from sync service. Used to notify
	 * clients about Codings being added to a document.
	 *
	 * @access private
	 * @arg {object} data - Object describing the change. At least contains:
	 *                      {string} authorSocket - Socket id of the author's
	 *                      {string} document - Document id to apply to
	 *                      {object[]} operations - Slate.Operations to apply
	 */
	_handleCodeApplied(data) {
		// Filter events that were initiated by this same client
		if (data.authorSocket !== this.syncService.getSocketId()) {
			this.syncService.fireEvent(EVT.DOCUMENT.CODE_APPLIED, data);
		}
	}
}
