import openSocket from 'socket.io-client';

import { MSG, EVT } from './constants.js';

// Sync server URL to be inserted in build process
const SYNC_SERVICE = '$SYNC_SERVICE$';

/**
 * Provides collaboration features for CodingEditor and sub-components
 *
 * Events:
 * - changeUserList: Fired when receiving updates on the list of users that are
 *                   connected to the same document as the current client.
 *   parameters:
 *     {object[]} userlist - Array of all users at the current document.Format
 *                           of the objects matches the format of objects sent
 *                           to {@link this#updateUser}.
 */
export default class SyncService {

	/**
	 * Constructor for SyncService.
	 */
	constructor() {
		this._socket = null;
		this._listeners = {};
		this._account = {};
		this._nextListenerId = 1;

		// Bind public methods to this
		this.updateUser = this.updateUser.bind(this);
		this.on = this.on.bind(this);
		this.off = this.off.bind(this);
		this.disconnect = this.disconnect.bind(this);

		// For debug: prevent console.log from being removed in build proceess
		this.console = window['con' + 'sole'];
		this.log = this.console.log.bind(this.console);

		// Connect to sync server
		this._connect();
	}

	/**
	 * Send current user's data to sync service
	 * @access public
	 * @arg {object} account - Any serializable object
	 */
	updateUser(account) {

		// Clone current account and update fields included in account parameter
		account = Object.assign(JSON.parse(JSON.stringify(this._account)), account);

		if (JSON.stringify(account) === JSON.stringify(this._account)) {
			return;
		}

		this._account = account;
		this._emitUserUpdate();
	}

	/**
	 * Listen to event from SyncService. See class documentation for available
	 * events.
	 * @access public
	 * @arg {string} evt - The name of the event to listen to
	 * @arg {function} cb - Callback to call if event occurs. See class
	 *                      documentation for number and type of arguments
	 *                      passed to the callback.
	 * @return {string} - Listener ID. Can be used to remove listener with
	 *                    {@link this#off}
	 */
	on(evt, cb) {
		// Lazily initialize listener list for that event
		if (!this._listeners[evt]) {
			this._listeners[evt] = {};
		}

		const listenerId = this._getNextListenerId();
		this._listeners[evt][listenerId] = cb;

		return listenerId;
	}

	/**
	 * Remove listener for event. See class documentation for available events.
	 * @access public
	 * @arg {string} evt - The name of the event to listen to
	 * @arg {string} listenerId - ID of the listener that was return by
	 *                            {@link this#on}
	 */
	off(evt, listenerId) {
		if (this._listeners[evt]) {
			delete this._listeners[evt][listenerId];
		}
	}

	/**
	 * Disconnect from sync server.
	 * @access public
	 */
	disconnect() {
		this._socket.disconnect();
	}

	/**
	 * Connect to the sync server.
	 * @access private
	 */
	_connect() {
		// If the SYNC_SERVICE constant starts with a `$` character, it has
		// not been set in build process.
		if (SYNC_SERVICE.substr(0, 1) === '$') {
			throw new Error('SYNC_SERVICE url was not configured. Please check your build configuration');
		}

		// Open a websocket to the sync server and register message handlers
		this._socket = openSocket(SYNC_SERVICE);
		this._socket.on(
			'reconnect',
			() => this._emitUserUpdate()
		);
		this._socket.on(
			EVT.USER.CONNECTED,
			hostname => this.log('Connected to realtime-service:', hostname)
		);
		this._socket.on(
			EVT.USER.UPDATED,
			userlist => this._handleUserListChange(userlist)
		);

		// Make sure, the websocket is closed when the browser is closed
		window.addEventListener('unload', this.disconnect);
	}

	/**
	 * Emit user.update message to sync service, sending {@link this#_account}.
	 * Used to identify the current user at the sync service.
	 * @access private
	 */
	_emitUserUpdate() {
		this._socket.emit(MSG.USER.UPDATE, this._account);
	}

	/**
	 * Handle changeUserList message from sync service. Used to notify clients
	 * about users entering or leaving the current document.
	 * @access private
	 * @arg {object[]} userlist - Array of all users at the current document.
	 *                            Format of the objects matches the format of
	 *                            objects sent to {@link this#updateUser}.
	 */
	_handleUserListChange(userlist) {
		this._fireEvent(
			'changeUserList',
			userlist.filter(({
				email
			}) => email !== this._account.email)
		);
	}

	/**
	 * Generate new unique listener ID.
	 * @access private
	 */
	_getNextListenerId() {
		return `_l_${this._nextListenerId++}`;
	}

	/**
	 * Notify potential listeners for specific event.
	 * @access private
	 * @arg {string} evt - The name of the event to fire
	 * @arg {...*} args - Arguments to pass to the listeners' callbacks. See
	 *                    class documentation for number and type of arguments
	 *                    to be passed.
	 */
	_fireEvent(evt, ...args) {
		if (this._listeners[evt]) {
			Object.values(this._listeners[evt]).forEach(cb => cb(...args));
		}
	}
};