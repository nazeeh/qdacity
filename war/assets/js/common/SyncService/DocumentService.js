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
	 * Apply code to range of document
	 * @access public
	 * @arg {string} documentId - The ID of the document which should receive
	 *                            the coding
	 * @arg {string} projectId - The ID of the current project
	 * @arg {string} projectType - The type of the current project
	 * @arg {object} range - The Slate.Range to which the coding should apply.
	 * @arg {object} mark - The Slate.Mark that should be applied.
	 * @arg {object} code - The code that should be applied.
	 * @return {Promise}
	 */
	applyCode(documentId, projectId, projectType, range, mark, code) {
		return this.syncService.emit(MSG.DOCUMENT.APPLY_CODE, {
			documentId,
			projectId,
			projectType,
			range,
			mark,
			code,
		});
	}

	/**
	 * Handle document.codeApplied message from sync service. Used to notify
	 * clients about Codings being added to a document.
	 * @access private
	 * @arg {object} code - The Code that has been updated.
	 */
	_handleCodeApplied(coding) {
		this.syncService.fireEvent('codeApplied', coding);
	}
}
