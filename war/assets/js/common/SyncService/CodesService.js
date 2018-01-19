import { MSG, EVT } from './constants.js';

export default class CodesService {
	constructor(syncService, socket) {
		this.syncService = syncService;

		// Bind public methods to this
		this.insertCode = this.insertCode.bind(this);
		this.relocateCode = this.relocateCode.bind(this);
		this.removeCode = this.removeCode.bind(this);

		// Initialize listeners
		[
			[EVT.CODE.INSERTED, this._handleCodeInserted],
			[EVT.CODE.RELOCATED, this._handleCodeRelocated],
			[EVT.CODE.REMOVED, this._handleCodeRemoved]
		].map(def => socket.on(def[0], def[1].bind(this)));
	}

	/**
	 * Send command to insert new Code into Codesystem
	 * @access public
	 * @arg {object} code - new Code object
	 * @arg {int} parentID - ID of parent of new Code object
	 * @return {Promise} - Promise (will never be rejected)
	 */
	insertCode(code, parentID) {
		return this.syncService.emit(MSG.CODE.INSERT, {
			resource: code,
			parentId: parentID
		});
	}

	/**
	 * Send command to relocate new Code to new parent in same Codesystem
	 * @access public
	 * @arg {int} codeId - ID of Code to be relocated
	 * @arg {int} newParentID - ID of Code where the code should be moved to
	 * @return {Promise} - Promise (will never be rejected)
	 */
	relocateCode(codeId, newParentID) {
		return this.syncService.emit(MSG.CODE.RELOCATE, {
			codeId,
			newParentID
		});
	}

	/**
	 * Send command to remove Code from Codesystem
	 * @access public
	 * @arg {object} code - Code object to be removed
	 * @return {Promise} - Promise (will never be rejected)
	 */
	removeCode(code) {
		return this.syncService.emit(MSG.CODE.REMOVE, {
			id: code.id
		});
	}

	/**
	 * Handle code.inserted message from sync service. Used to notify clients
	 * about new Codes inserted in their current CodeSystem.
	 * @access private
	 * @arg {object} code - The Code that has been inserted.
	 */
	_handleCodeInserted(code) {
		this.syncService.fireEvent('codeInserted', code);
	}

	/**
	 * Handle code.relocated message from sync service. Used to notify clients
	 * about new Codes relocated inside their current CodeSystem.
	 * @access private
	 * @arg {object} code - The Code that has been relocated.
	 */
	_handleCodeRelocated(code) {
		this.syncService.fireEvent('codeRelocated', code);
	}

	/**
	 * Handle code.removed message from sync service. Used to notify clients
	 * about Codes being removed from their current CodeSystem.
	 * @access private
	 * @arg {object} code - The Code that has been removed.
	 */
	_handleCodeRemoved(code) {
		this.syncService.fireEvent('codeRemoved', code);
	}
}
