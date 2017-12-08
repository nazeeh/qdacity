import openSocket from 'socket.io-client';

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
 *                           to {@link this#logon}.
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
		this.logon = this.logon.bind(this);
		this.handleDocumentChange = this.handleDocumentChange.bind(this);
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
	 * Logon at sync server.
	 * @access public
	 * @arg {object} account - Any serializable object
	 */
	logon(account) {

		if (JSON.stringify(account) === JSON.stringify(this._account)) {
			return;
		}

		this._account = account;
		this._emitLogon();
	}

	/**
	 * Notify SyncService about a document change in the UI.
	 * @access public
	 * @arg {null|string} oldDocumentId - ID of document that is left
	 * @arg {string} newDocumentId - ID of document that is entered
	 */
	handleDocumentChange(oldDocumentId, newDocumentId) {
		if (oldDocumentId !== null) {
			this._emitDocumentLeave(oldDocumentId);
		}
		this._emitDocumentEnter(newDocumentId);
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
		this._socket.on('welcome', hostname => this.log('Connected to rtc-svc-server:', hostname));
		this._socket.on('reconnect', () => this._emitLogon());
		this._socket.on('user_change', userlist => this._handleUserListChange(userlist));

		// Make sure, the websocket is closed when the browser is closed
		window.addEventListener('unload', () => this.disconnect());
	}

	/**
	 * Emit logon message to sync service, sending {@link this#_account}.
	 * Used to identify the current user at the sync service.
	 * @access private
	 */
	_emitLogon() {
		this._socket.emit('logon', this._account);
	}

	/**
	 * Emit documentEnter message to sync service. Used to subscribe to changes
	 * to that document at the sync service.
	 * @access private
	 * @arg {string} docid - ID of document that is entered
	 */
	_emitDocumentEnter(docid) {
		this._socket.emit('documentEnter', docid);
	}

	/**
	 * Emit documentLeave message to sync service. Used to unsubscribe from
	 * changes to that document at the sync service.
	 * @access private
	 * @arg {string} docid - ID of document that is left
	 */
	_emitDocumentLeave(docid) {
		this._socket.emit('documentLeave', docid);
	}

	/**
	 * Handle changeUserList message from sync service. Used to notify clients
	 * about users entering or leaving the current document.
	 * @access private
	 * @arg {object[]} userlist - Array of all users at the current document.
	 *                            Format of the objects matches the format of
	 *                            objects sent to {@link this#logon}.
	 */
	_handleUserListChange(userlist) {
		this._fireEvent('changeUserList', userlist);
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