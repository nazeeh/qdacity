import CodesEndpoint from '../endpoints/CodesEndpoint';
import { MSG } from './constants.js';

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
				console.log("unhandled message type")
		}
	}

}
