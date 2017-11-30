import openSocket from 'socket.io-client'

const SYNC_SERVICE = '$SYNC_SERVICE$';

export default class SyncService {

	constructor() {
		this.socket = null;
		this.nextListenerId = 1;
		this.listeners = { changeUserList: {} };
		this.name = '';
		this.email = '';
		this.picSrc = '';

		this.handleDocumentChange = this.handleDocumentChange.bind(this);
	}

	logon(name, email, picSrc) {
		if (typeof name === 'object') {
			email = name.email;
			picSrc = name.picSrc;
			name = name.name;
		}

		if (email === this.email) {
			return;
		}

		const forcedConsole = window['con' + 'sole'];

		if (SYNC_SERVICE.substr(0, 1) !== '$') {

			this.socket = openSocket(SYNC_SERVICE);
			this.socket.on('connect', () => {
				this.socket.emit('logon', name, email, picSrc);
			});
			this.socket.on('meta', (meta, hostname) => {
				forcedConsole.log('Connected to rtc-svc-server:', hostname);
			});
			this.socket.on('user_change', (docid, userlist) => {
				this.handleUserListChange(userlist);
			});

			window.addEventListener('unload', () => this.disconnect.bind(this));
		}
	}

	handleUserListChange(userlist) {
		this._fireEvent('changeUserList', userlist);
	}

	handleDocumentChange(oldDocumentId, newDocumentId) {
		if (this.socket !== null) {
			if (oldDocumentId !== -1) {
				this.socket.emit('user_leave', oldDocumentId);
			}
			this.socket.emit('user_enter', newDocumentId);
		}
	}

	isLoggedOn() {
		return this.socket !== null;
	}

	disconnect() {
		if (this.socket !== null) {
			this.socket.disconnect();
		}
	}

	_getNextListenerId() {
		return `_l_${this.nextListenerId++}`;
	}

	on(evt, cb, callNowWithLastUpdate = false) {
		const listenerId = this._getNextListenerId();
		this.listeners[evt][listenerId] = cb;
		return listenerId;
	}

	off(evt, listenerId) {
		delete this.listeners[evt][listenerId];
	}

	_fireEvent(evt, ...args) {
		Object.values(this.listeners[evt]).forEach(cb => cb(...args));
	}

};
