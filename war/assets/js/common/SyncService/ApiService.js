import CodesEndpoint from '../endpoints/CodesEndpoint';
import { MSG } from './constants.js';
import Alert from '../modals/Alert.js';

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

	/**
	 * Translate message to api requests and executes this request
	 * @access package
	 * @return {Promise} - resolves on success, rejects on failure or unhandled message
	 */
	emit(messageType, arg) {
		const _this = this;
		switch (messageType) {
			case MSG.CODE.INSERT:
				return CodesEndpoint.insertCode(arg.resource, arg.relationId, arg.relationSourceCodeId, arg.parentId)
					.then(function (code) {
						_this.syncService.fireEvent('codeInserted', code);
					});
			case MSG.USER.UPDATE:
				break;
			default:
				new Alert('This Operation is not (yet) supported in offline mode').showModal();
				return Promise.reject("Unhandled message type");
		}
	}

}
