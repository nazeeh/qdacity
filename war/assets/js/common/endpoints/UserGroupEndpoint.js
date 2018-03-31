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

    static listUserGroups(userId = null) {
		var apiMethod = gapi.client.qdacity.usergroup.listUserGroups({
            userId: userId
        });
		return Promisizer.makePromise(apiMethod);
    }
}
