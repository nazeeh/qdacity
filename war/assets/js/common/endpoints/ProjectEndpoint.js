import Promisizer from './Promisizer';

export default class ProjectEndpoint {
	constructor() {}

	static listProject() {
		var apiMethod = gapi.client.qdacity.project.listProject();
		return Promisizer.makePromise(apiMethod);
	}

	static listProjectByUserId(userId) {
		var apiMethod = gapi.client.qdacity.project.listProjectByUserId({
			userId: userId
		});
		return Promisizer.makePromise(apiMethod);
	}

	static listValidationProject() {
		var apiMethod = gapi.client.qdacity.project.listValidationProject();
		return Promisizer.makePromise(apiMethod);
	}

	static listValidationProjectByUserId(userId) {
		var apiMethod = gapi.client.qdacity.project.listValidationProjectByUserId({
			userId: userId
		});
		return Promisizer.makePromise(apiMethod);
	}

	static removeProject(prjId) {
		var apiMethod = gapi.client.qdacity.project.removeProject({
			id: prjId
		});
		return Promisizer.makePromise(apiMethod);
	}

	static removeUser(prjId, prjType) {
		var apiMethod = gapi.client.qdacity.project.removeUser({
			projectID: prjId,
			projectType: prjType
		});
		return Promisizer.makePromise(apiMethod);
	}

	deleteRevision(revisionId) {
		var apiMethod = gapi.client.qdacity.project.removeProjectRevision({
			id: revisionId
		});
		return Promisizer.makePromise(apiMethod);
	}

	static removeValidationProject(prjId) {
		var apiMethod = gapi.client.qdacity.project.removeValidationProject({
			id: prjId
		});
		return Promisizer.makePromise(apiMethod);
	}

	requestValidationAccess(revId) {
		var apiMethod = gapi.client.qdacity.project.requestValidationAccess({
			revisionID: revId
		});
		return Promisizer.makePromise(apiMethod);
	}

	//FIXME move to validationEndpoint
	evaluateRevision(revId, name, docs, method, unit) {
		var apiMethod = gapi.client.qdacity.validation.evaluateRevision({
			revisionID: revId,
			name: name,
			docs: docs,
			method: method,
			unit: unit
		});
		return Promisizer.makePromise(apiMethod);
	}

	static getProjectStats(prjID, prjType) {
		var apiMethod = gapi.client.qdacity.project.getProjectStats({
			id: prjID,
			projectType: prjType
		});
		return Promisizer.makePromise(apiMethod);
	}

	static getProject(prjID, prjType) {
		var apiMethod = gapi.client.qdacity.project.getProject({
			id: prjID,
			type: prjType
		});
		return Promisizer.makePromise(apiMethod);
	}

	static listRevisions(prjID) {
		var apiMethod = gapi.client.qdacity.project.listRevisions({
			projectID: prjID
		});
		return Promisizer.makePromise(apiMethod);
	}

	static listRevisionsExcludingValidation(prjID) {
		var apiMethod = gapi.client.qdacity.project.listRevisionsExcludingValidation(
			{
				projectID: prjID
			}
		);
		return Promisizer.makePromise(apiMethod);
	}

	static inviteUser(prjID, userEmail) {
		var apiMethod = gapi.client.qdacity.project.inviteUser({
			projectID: prjID,
			userEmail: userEmail
		});
		return Promisizer.makePromise(apiMethod);
	}

	static createSnapshot(prjID, comment) {
		var apiMethod = gapi.client.qdacity.project.createSnapshot({
			projectID: prjID,
			comment: comment
		});
		return Promisizer.makePromise(apiMethod);
	}

	static setDescription(prjId, projectType, description) {
		var apiMethod = gapi.client.qdacity.project.setDescription({
			projectID: prjId,
			projectType: projectType,
			description: description
		});
		return Promisizer.makePromise(apiMethod);
	}

	static setUmlEditorEnabled(prjId, projectType, umlEditorEnabled) {
		var apiMethod = gapi.client.qdacity.project.setUmlEditorEnabled({
			projectID: prjId,
			projectType: projectType,
			umlEditorEnabled: umlEditorEnabled
		});
		return Promisizer.makePromise(apiMethod);
	}

	static insertProject(project) {
		var apiMethod = gapi.client.qdacity.project.insertProject(project);
		return Promisizer.makePromise(apiMethod);
	}

	static insertProjectForUserGroup(userGroupId, project) {
		var apiMethod = gapi.client.qdacity.project.insertProjectForUserGroup({userGroupId: userGroupId}, project);
		return Promisizer.makePromise(apiMethod);
	}

	static addOwner(prjId) {
		var apiMethod = gapi.client.qdacity.project.addOwner({
			projectID: prjId
		});
		return Promisizer.makePromise(apiMethod);
	}

	static createValidationProject(prjId, userId) {
		var apiMethod = gapi.client.qdacity.project.createValidationProject({
			projectID: prjId,
			userID: userId
		});
		return Promisizer.makePromise(apiMethod);
	}

	static incrCodingId(prjId, prjType) {
		var apiMethod = gapi.client.qdacity.project.incrCodingId({
			id: prjId,
			type: prjType
		});
		return Promisizer.makePromise(apiMethod);
	}
}
