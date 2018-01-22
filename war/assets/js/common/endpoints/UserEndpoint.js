import Promisizer from './Promisizer';

export default class ProjectEndpoint {
	constructor() {}

	static listValidationCoders(prjId) {
		var apiMethod = gapi.client.qdacity.user.listValidationCoders({
			validationProject: prjId
		});
		return Promisizer.makePromise(apiMethod);
	}

	static removeUser(id) {
		var apiMethod = gapi.client.qdacity.removeUser({
			id: id
		});
		return Promisizer.makePromise(apiMethod);
	}

	static updateUser(user) {
		var apiMethod = gapi.client.qdacity.updateUser(user);
		return Promisizer.makePromise(apiMethod);
	}

	static listUser(prjId) {
		var apiMethod = gapi.client.qdacity.user.listUser({
			projectID: prjId
		});
		return Promisizer.makePromise(apiMethod);
	}

	static listUserByCourse(courseID) {
		var apiMethod = gapi.client.qdacity.user.listUserByCourse({
			courseID: courseID
		});
		return Promisizer.makePromise(apiMethod);
	}

	static findUsers(searchTerm) {
		var apiMethod = gapi.client.qdacity.user.findUsers({
			searchTerm: searchTerm
		});
		return Promisizer.makePromise(apiMethod);
	}

	static listUserNotification(notification) {
		var apiMethod = gapi.client.qdacity.user.listUserNotification();
		return Promisizer.makePromise(apiMethod);
	}

	static updateUserNotification(notification) {
		var apiMethod = gapi.client.qdacity.user.updateUserNotification(
			notification
		);
		return Promisizer.makePromise(apiMethod);
	}
}
