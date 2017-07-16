import Promisizer from './Promisizer'

export default class CodePositionEndpoint {
	constructor() {}

	static listCodePositions(codeSystemId) {
		var apiMethod = gapi.client.qdacity.umlCodePosition.listCodePositions({
			'codesystemId': codeSystemId
		});
		return Promisizer.makePromise(apiMethod);
	}

	static insertCodePositions(umlCodePositions) {
		var apiMethod = gapi.client.qdacity.umlCodePosition.insertCodePositions({
			'umlCodePositions': umlCodePositions
		});
		return Promisizer.makePromise(apiMethod);
	}

	static updateCodePositions(umlCodePositions) {
		var apiMethod = gapi.client.qdacity.umlCodePosition.updateCodePositions({
			'umlCodePositions': umlCodePositions
		});
		return Promisizer.makePromise(apiMethod);
	}
}