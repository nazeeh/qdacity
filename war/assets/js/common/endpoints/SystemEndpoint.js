import Promisizer from './Promisizer'

export default class SystemEndpoint {
	constructor() {}

	static initializeDatabase(initializeMetaModel) {
		var apiMethod = gapi.client.qdacity.system.initializeDatabase({
			'initializeMetaModel': initializeMetaModel
		});
		return Promisizer.makePromise(apiMethod);
	}
	
}