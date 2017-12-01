import { objectHasKeys } from './utils';
import openSocket from 'socket.io-client';

const SYNC_SERVICE = '$SYNC_SERVICE$';

export default class SyncService {

	constructor() {
		this.socket = null;
		this.nextListenerId = 1;
		this.listeners = { changeUserList: {} };
		this.email = '';

		this._connect();

		this.handleDocumentChange = this.handleDocumentChange.bind(this);
	}

	_connect() {
		const forcedConsole = window['con' + 'sole'];

		if (SYNC_SERVICE.substr(0, 1) === '$') {
			throw new Error('SYNC_SERVICE url was not configured. Please check your build configuration');
		}
		this.socket = openSocket(SYNC_SERVICE);
		this.socket.on('meta', (meta, hostname) => {
			forcedConsole.log('Connected to rtc-svc-server:', hostname);
		});
		this.socket.on('user_change', (docid, userlist) => {
			this.handleUserListChange(userlist);
		});

		window.addEventListener('unload', () => this.disconnect());
	}

	logon(account) {
		if (!objectHasKeys(account, ['name', 'email', 'picSrc'])) {
			throw new Error('SyncService.logon expects 1 parameter object with keys `name`, `email, `picSrc`');
		}

		const {
			email,
			picSrc,
			name,
		} = account;

		if (email === this.email) {
			return;
		}

		this.email = account.email;
		this.socket.emit('logon', name, email, picSrc);
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
