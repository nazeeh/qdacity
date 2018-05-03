import CodesEndpoint from '../endpoints/CodesEndpoint';
import { MSG } from './constants.js';

/**
 * Provides fallback to api requests for SyncService
 *
 * ApiService.emit() can be used in SyncService.emit() if SyncService.socket.emit() fails (=>disconnected)
 *
 * For every supported message type the corresponding api endpoint will be called
 *
 */
export default class ApiService {
	constructor(syncService) {
		this.syncService = syncService;
	}

	emit(messageType, arg) {
		const _this = this;
		switch (messageType) {
			case MSG.CODE.INSERT:
				return CodesEndpoint.insertCode(arg.resource, arg.relationId, arg.relationSourceCodeId, arg.parentId)
					.then(function (code) {
						_this.syncService.fireEvent('codeInserted', code);
					});
			default:
				return Promise.reject("Unhandled message type");
		}
	}

}
