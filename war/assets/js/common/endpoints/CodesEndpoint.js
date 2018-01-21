import Promisizer from './Promisizer';

export default class CodesEndpoint {
	constructor() {}

	static insertCode(code, parentID, relationId, relationSourceCodeId) {
		if (relationId == undefined) {
			relationId = null;
		}
		if (relationSourceCodeId == undefined) {
			relationSourceCodeId = null;
		}

		var apiMethod = gapi.client.qdacity.codes.insertCode(
			{
				relationId: relationId,
				relationSourceCodeId: relationSourceCodeId,
				parentId: parentID
			},
			code
		);
		return Promisizer.makePromise(apiMethod);
	}

	static updateCode(code) {
		var apiMethod = gapi.client.qdacity.codes.updateCode(code);
		return Promisizer.makePromise(apiMethod);
	}

	static updateRelationshipCode(
		relationshipCodeId,
		relationSourceId,
		relationId
	) {
		var apiMethod = gapi.client.qdacity.codes.updateRelationshipCode({
			relationshipCodeId: relationshipCodeId,
			relationSourceId: relationSourceId,
			relationId: relationId
		});
		return Promisizer.makePromise(apiMethod);
	}

	static updateRelationshipCodeMetaModel(relationshipCodeId, newMetaModelId) {
		var apiMethod = gapi.client.qdacity.codes.updateRelationshipCodeMetaModel({
			relationshipCodeId: relationshipCodeId,
			newMetaModelId: newMetaModelId
		});
		return Promisizer.makePromise(apiMethod);
	}

	static removeCode(code) {
		var apiMethod = gapi.client.qdacity.codes.removeCode(code);
		return Promisizer.makePromise(apiMethod);
	}

	static setCodeBookEntry(codeId, codebookEntry) {
		var apiMethod = gapi.client.qdacity.codes.setCodeBookEntry(
			{
				codeId: codeId
			},
			codebookEntry
		);
		return Promisizer.makePromise(apiMethod);
	}

	static relocateCode(codeId, newParentId) {
		var apiMethod = gapi.client.qdacity.codes.relocateCode({
			codeId: codeId,
			newParentID: newParentId
		});
		return Promisizer.makePromise(apiMethod);
	}

	static getCode(codeId) {
		var apiMethod = gapi.client.qdacity.codes.getCode({
			id: codeId
		});
		return Promisizer.makePromise(apiMethod);
	}

	static addRelationship(srcId, dstId, mmElementId, createIfItExists) {
		if (createIfItExists == null) {
			createIfItExists = true;
		}

		var apiMethod = gapi.client.qdacity.codes.addRelationship(
			{
				sourceCode: srcId,
				createIfItExists: createIfItExists
			},
			{
				codeId: dstId,
				mmElementId: mmElementId
			}
		);
		return Promisizer.makePromise(apiMethod);
	}

	static removeRelationship(codeId, relationshipId) {
		var apiMethod = gapi.client.qdacity.codes.removeRelationship({
			codeId: codeId,
			relationshipId: relationshipId
		});
		return Promisizer.makePromise(apiMethod);
	}

	static removeAllRelationships(id) {
		var apiMethod = gapi.client.qdacity.codes.removeAllRelationships({
			id: id
		});
		return Promisizer.makePromise(apiMethod);
	}
}
