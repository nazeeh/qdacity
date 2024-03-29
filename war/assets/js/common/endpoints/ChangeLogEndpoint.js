import Promisizer from './Promisizer';

export default class ChangeLogEndpoint {
	constructor() {}

	static listChangeStats(prjId, prjType) {
		var apiMethod = gapi.client.qdacity.changelog.listChangeStats({
			filterType: 'project',
			projectID: prjId,
			projectType: prjType
		});
		return Promisizer.makePromise(apiMethod);
	}

	static getChanges(objectType, changeType, startDate, endDate) {
		let apiMethod = gapi.client.qdacity.changelog.getChanges({
			objectType: objectType,
			changeType: changeType,
			startDate: startDate.toISOString(),
			endDate: endDate.toISOString()
		});
		return Promisizer.makePromise(apiMethod);
	}
}
