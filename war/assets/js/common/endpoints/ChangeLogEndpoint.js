import Promisizer from './Promisizer'

export default class ChangeLogEndpoint {
	constructor() {
	}
 

	static listChangeStats(prjId, prjType){
		var apiMethod = gapi.client.qdacity.changelog.listChangeStats({'filterType': "project", 'projectID' : prjId, 'projectType' : prjType});
		return Promisizer.makePromise(apiMethod);
	}


}