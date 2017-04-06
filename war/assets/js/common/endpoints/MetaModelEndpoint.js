import Promisizer from './Promisizer'

export default class MetaModelEndpoint {
	constructor() {}

	static listEntities(mmId) {
		var apiMethod = gapi.client.qdacity.metamodel.listEntities({
			'metaModelId': mmId
		});
		return Promisizer.makePromise(apiMethod);
	}

	static listRelations(mmId) {
		var apiMethod = gapi.client.qdacity.metamodel.listRelations({
			'metaModelId': mmId
		});
		return Promisizer.makePromise(apiMethod);
	}


}