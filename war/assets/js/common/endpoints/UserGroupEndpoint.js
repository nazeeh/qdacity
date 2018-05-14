import Promisizer from './Promisizer';

export default class UserGroupEndpoint {
	constructor() {}

	static insertUserGroup(name) {
		var apiMethod = gapi.client.qdacity.usergroup.insertUserGroup({
			name: name
		});
		return Promisizer.makePromise(apiMethod);
	}

	static listOwnedUserGroups(userId = null) {
		var apiMethod = gapi.client.qdacity.usergroup.listOwnedUserGroups({
			userId: userId
		});
		return Promisizer.makePromise(apiMethod);
	}

	static getUserGroupById(groupId) {
		var apiMethod = gapi.client.qdacity.usergroup.getById({
			groupId: groupId
		});
		return Promisizer.makePromise(apiMethod);
	}

	static listUserGroups(userId = null) {
		var apiMethod = gapi.client.qdacity.usergroup.listUserGroups({
			userId: userId
		});
		return Promisizer.makePromise(apiMethod);
	}

	static getUsers(groupId) {
		var apiMethod = gapi.client.qdacity.usergroup.getUsers({
			groupId: groupId
		});
		return Promisizer.makePromise(apiMethod);
	}

	static addParticipantByEmail(groupId, userEmail) {
		var apiMethod = gapi.client.qdacity.usergroup.addParticipantByEmail({
			groupId: groupId,
			userEmail: userEmail
		});
		return Promisizer.makePromise(apiMethod);
	}
}
