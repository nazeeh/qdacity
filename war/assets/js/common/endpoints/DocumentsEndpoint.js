import Promisizer from './Promisizer'

export default class DocumentsEndpoint {
	constructor() {}

	static getDocuments(projectId, projectType) {
		var _this = this;
		var promise = new Promise(
			function (resolve, reject) {
				gapi.client.qdacity.documents.getTextDocument({
					'id': projectId,
					'projectType': projectType
				}).execute(function (resp) {
					if (!resp.code) {
						resp.items = resp.items || [];

						resolve(resp.items);
					} else {
						reject(resp.code);
					}
				});
			}

		);
		return promise;
	}

	static insertTextDocument(doc) {
		var apiMethod = gapi.client.qdacity.documents.insertTextDocument(doc);
		return Promisizer.makePromise(apiMethod);
	}

	static updateTextDocument(doc) {
		var apiMethod = gapi.client.qdacity.documents.updateTextDocument(doc);
		return Promisizer.makePromise(apiMethod);
	}

	static updateTextDocuments(documents) {
		var apiMethod = gapi.client.qdacity.documents.updateTextDocuments(documents);
		return Promisizer.makePromise(apiMethod);
	}

	static applyCode(doc, code) {
		var documentCode = new function () {
			this.textDocument = doc;
			this.code = code;
		}
		var apiMethod = gapi.client.qdacity.documents.applyCode(documentCode);
		return Promisizer.makePromise(apiMethod);
	}

	static removeTextDocument(doc) {
		var apiMethod = gapi.client.qdacity.documents.removeTextDocument(doc);
		return Promisizer.makePromise(apiMethod);
	}

	static getAgreementMaps(mapId, prjType) {
		var apiMethod = gapi.client.qdacity.documents.getAgreementMaps({
			'id': mapId,
			'projectType': prjType
		});
		return Promisizer.makePromise(apiMethod);
	}


}