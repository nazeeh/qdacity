import Promisizer from './Promisizer';

export default class ProjectEndpoint {
	constructor() {}

	listReports(projectId) {
		var promise = new Promise(function(resolve, reject) {
			gapi.client.qdacity.validation
				.listReports({
					projectID: projectId
				})
				.execute(function(resp) {
					if (!resp.code) {
						//Hashmap with list as value
						var reportsByRevision = {};
						if (typeof resp.items != 'undefined') {
							for (var i = 0; i < resp.items.length; i++) {
								if (reportsByRevision[resp.items[i].revisionID] === undefined)
									reportsByRevision[resp.items[i].revisionID] = [];
								reportsByRevision[resp.items[i].revisionID].push(resp.items[i]);
							}
						}
						resolve(reportsByRevision);
					} else {
						reject(resp);
					}
				});
		});

		return promise;
	}

	deleteReport(repId) {
		var apiMethod = gapi.client.qdacity.validation.deleteReport({
			reportID: repId
		});
		return Promisizer.makePromise(apiMethod);
	}

	sendNotificationEmail(reportID) {
		var apiMethod = gapi.client.qdacity.validation.sendNotificationEmail({
			reportID: reportID
		});
		return Promisizer.makePromise(apiMethod);
	}

	static getValidationResult(reportID, prjId) {
		var apiMethod = gapi.client.qdacity.validation.getValidationResult({
			reportID: reportID,
			validationProjectID: prjId
		});
		return Promisizer.makePromise(apiMethod);
	}

	static listValidationResults(repId) {
		var apiMethod = gapi.client.qdacity.validation.listValidationResults({
			reportID: repId
		});
		return Promisizer.makePromise(apiMethod);
	}
}
