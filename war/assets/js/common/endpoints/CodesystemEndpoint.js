import Promisizer from './Promisizer'

export default class CodesystemEndpoint {
	constructor() {}


	static insertCodeSystem(prjId, prjType) {
		var apiMethod = gapi.client.qdacity.codesystem.insertCodeSystem({
			'project': prjId,
			'projectType': prjType
		});
		return Promisizer.makePromise(apiMethod);
	}

	static updateCodeSystem(codeSystem) {
		var apiMethod = gapi.client.qdacity.codesystem.updateCodeSystem(codeSystem);
		return Promisizer.makePromise(apiMethod);
	}

	static getCodeSystem(codeSystemId) {
		var apiMethod = gapi.client.qdacity.codesystem.getCodeSystem({
			'id': codeSystemId
		});
		return Promisizer.makePromise(apiMethod);
	}


}