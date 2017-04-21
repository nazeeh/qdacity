import Promisizer from './Promisizer'

export default class ChangeLogEndpoint {
	constructor() {}

	static getAdminStats() {
		var apiMethod = gapi.client.qdacity.admin.getAdminStats();
		return Promisizer.makePromise(apiMethod);
	}

}