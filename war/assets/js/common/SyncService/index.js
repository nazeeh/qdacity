import openSocket from 'socket.io-client';

import CodesService from './CodesService';
import DocumentService from './DocumentService';
import { MSG, EVT } from './constants.js';

/**
 * Provides collaboration features for CodingEditor and sub-components
 *
 * Events:
 * - userlistUpdated: Fired when receiving updates on the list of users that
 *                    are connected to the same document as the current client.
 *   parameters:
 *   parameters:
 *     {object[]} - Array of all users at the current document. Format of the
 *                  objects matches the format of objects sent to
 *                  {@link this#updateUser}.
 *
 * - codeInserted: Fired when a new code has been inserted into the current
 *                 Codesystem
 *   parameters:
 *     {object} - Object representing the newly inserted code
 *
 * - codeRelocated: Fired when an existing code has been relocated inside the
 *                  current Codesystem
 *   parameters:
 *     {object} - Object representing the relocated code
 *
 * - codeRemoved: Fired when an existing code has been removed from the current
 *                Codesystem
 *   parameters:
 *     {object} - Object representing the removed code
 *
 * - codeUpdated: Fired when an existing code has been updated
 *   parameters:
 *     {object} - Object representing the updated code
 */
export default class SyncService {
	/**
	 * Constructor for SyncService.
	 */
	constructor(setRTCSConnectionState) {
		this._socket = null;
		this.setRTCSConnectionsState = setRTCSConnectionState;
		this._listeners = {};
		this._userdata = {
			apiRoot: '$API_PATH$',
			apiVersion: '$API_VERSION$'
		};
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

		// Register sub-services
		this.codes = new CodesService(this, this._socket);
		this.documents = new DocumentService(this, this._socket);
	}

	/**
	 * Send current user's data to sync service
	 * @access public
	 * @arg {object} userdata - Any serializable object
	 */
	updateUser(userdata) {
		// Clone current userdata and update fields included in userdata parameter
		userdata = Object.assign(
			JSON.parse(JSON.stringify(this._userdata)),
			userdata
		);
		if (JSON.stringify(userdata) === JSON.stringify(this._userdata)) {
			return;
		}

		this._userdata = userdata;
		this._emitUserUpdate();
	}

	/**
	 * Listen to event from SyncService. See class documentation for available
	 * events.
	 * @access public
	 * @arg {string} evt - The name of the event to listen to
	 * @arg {function} callback - Callback to call if event occurs. See class
	 *                            documentation for number and type of
	 *                            arguments passed to the callback.
	 * @return {string} - Listener ID. Can be used to remove listener with
	 *                    {@link this#off}
	 */
	on(evt, callback) {
		// Lazily initialize listener list for that event
		if (!this._listeners[evt]) {
			this._listeners[evt] = {};
		}

		const listenerId = `_l_${this._nextListenerId++}`;
		this._listeners[evt][listenerId] = callback;

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
	 * Notify potential listeners for specific event.
	 * @access package
	 * @arg {string} evt - The name of the event to fire
	 * @arg {...*} args - Arguments to pass to the listeners' callbacks. See
	 *                    class documentation for number and type of arguments
	 *                    to be passed.
	 */
	fireEvent(evt, ...args) {
		if (this._listeners[evt]) {
			Object.values(this._listeners[evt]).forEach(cb => cb(...args));
		}
	}

	/**
	 * Emit message to sync service
	 * @access package
	 * @return {Promise} - resolves on success, rejects on failure
	 */
	emit(messageType, arg) {
		return new Promise((resolve, reject) => {
			this._socket.emit(messageType, arg, (status, ...args) => {
				if (status === 'ok') {
					this.console.log(status);
					resolve(...args);
				} else {
					this.console.error('API error', ...args);
					this.console.log(status);
					reject(...args);
				}
			});
		});
	}

	/**
	 * Getter for socket id
	 * @access package
	 * @return {string} socket id
	 */
	getSocketId() {
		return this._socket.id;
	}

	/**
	 * Connect to the sync server.
	 * @access private
	 */
	_connect() {
		// Open a websocket to the sync server and register message handlers
		this._socket = openSocket('$SYNC_SERVICE$');

		// Initialize listeners
		[
			// Send user data again on reconnect
			['reconnect', this._emitUserUpdate],
			['connect_error', this._handleConnectError],

			// Handle user events
			[EVT.USER.CONNECTED, this._handleUserConnected],
			[EVT.USER.UPDATED, this._handleUserListChange]
		].map(def => this._socket.on(def[0], def[1].bind(this)));

		// Make sure, the websocket is closed when the browser is closed
		window.addEventListener('unload', this.disconnect);
	}

	/**
	 * Emit user.update message to sync service, sending {@link this#_userdata}.
	 * Used to identify the current user at the sync service.
	 * @access private
	 */
	_emitUserUpdate() {
		this.emit(MSG.USER.UPDATE, this._userdata);
	}

	/**
	 * Handle user.connected message from sync service. Used to welcome clients
	 * telling which server they are connected to.
	 * @access private
	 * @arg {string} serverName - Name of the connected server
	 */
	_handleUserConnected(serverName) {
		this.log('Connected to realtime-service:', serverName);
		this.setRTCSConnectionsState(true);
	}

	_handleConnectError() {
		this.setRTCSConnectionsState(false);
	}

	/**
	 * Handle user.updated message from sync service. Used to notify clients
	 * about users entering or leaving the current document.
	 * @access private
	 * @arg {object[]} userlist - Array of all users at the current document.
	 *                            Format of the objects matches the format of
	 *                            objects sent to {@link this#updateUser}.
	 */
	_handleUserListChange(userlist) {
		this.fireEvent(
			'userlistUpdated',
			userlist.filter(user => user.email !== this._userdata.email)
		);
	}
}
