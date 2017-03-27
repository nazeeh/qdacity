import Promisizer from './Promisizer'

export default class CodesEndpoint {
	constructor() {
	}
 

	static insertCode(code){
		var apiMethod = gapi.client.qdacity.codes.insertCode(code);
		return Promisizer.makePromise(apiMethod);
	}
	
	static updateCode(code){
		var apiMethod = gapi.client.qdacity.codes.updateCode(code);
		return Promisizer.makePromise(apiMethod);
	}
	
	static removeCode(code){
		var apiMethod = gapi.client.qdacity.codes.removeCode(code);
		return Promisizer.makePromise(apiMethod);
	}
	
	static setCodeBookEntry(codeId, codebookEntry){
		var apiMethod = gapi.client.qdacity.codes.setCodeBookEntry({'codeId' : getActiveCode().dbID },codeBookEntry);
		return Promisizer.makePromise(apiMethod);
	}
	
	static relocateCode(codeId, newParentId){
		var apiMethod = gapi.client.qdacity.codes.relocateCode({	'codeId' : codeId, 'newParentID' : newParentId});
		return Promisizer.makePromise(apiMethod);
	}
	
	static getCode(codeId){
		var apiMethod = gapi.client.qdacity.codes.getCode({'id' : codeId });
		return Promisizer.makePromise(apiMethod);
	}
	
	static addRelationship(srcId, dstId, mmElementId){
		var apiMethod = gapi.client.qdacity.codes.addRelationship({'sourceCode' : srcId}, {'codeId': dstId, 'mmElementId': mmElementId});
		return Promisizer.makePromise(apiMethod);
	}
	
	static removeRelationship(codeId, relationshipId){
		var apiMethod = gapi.client.qdacity.codes.removeRelationship({'codeId' : codeId, 'relationshipId': relationshipId});
		return Promisizer.makePromise(apiMethod);
	}
}