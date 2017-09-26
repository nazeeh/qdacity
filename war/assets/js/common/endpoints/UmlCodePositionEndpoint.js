import Promisizer from './Promisizer'

export default class CodePositionEndpoint {
	constructor() {}

	static listCodePositions(codeSystemId) {
		var apiMethod = gapi.client.qdacity.umlCodePosition.listCodePositions({
			'codesystemId': codeSystemId
		});
		return Promisizer.makePromise(apiMethod);
	}

	static insertOrUpdateCodePositions(umlCodePositions) {
		var apiMethod = gapi.client.qdacity.umlCodePosition.insertOrUpdateCodePositions({
			'umlCodePositions': umlCodePositions
		});
		return Promisizer.makePromise(apiMethod);
	}
}