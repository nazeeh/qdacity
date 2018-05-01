import CodesEndpoint from '../endpoints/CodesEndpoint';
import { MSG } from './constants.js';
import Alert from '../modals/Alert.js';

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
			case MSG.USER.UPDATE:
				break;
			default:
				new Alert('This Operation is not (yet) supported in offline mode').showModal();
		}
	}

}
