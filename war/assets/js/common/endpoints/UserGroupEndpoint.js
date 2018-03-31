import Promisizer from './Promisizer';

export default class UserGroup {
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
}
