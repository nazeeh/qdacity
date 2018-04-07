import Promisizer from './Promisizer';

export default class CourseEndpoint {
	constructor() {}

	static listCourse() {
		var apiMethod = gapi.client.qdacity.course.listCourse();
		return Promisizer.makePromise(apiMethod);
	}

	static listCourseByUserGroupId(userGroupId) {
		var apiMethod = gapi.client.qdacity.course.listByUserGroupId({
			userGroupId: userGroupId
		});
		return Promisizer.makePromise(apiMethod);
	}

	static removeCourse(crsId) {
		var apiMethod = gapi.client.qdacity.course.removeCourse({
			id: crsId
		});
		return Promisizer.makePromise(apiMethod);
	}

	static insertCourse(course) {
		var apiMethod = gapi.client.qdacity.course.insertCourse(course);
		return Promisizer.makePromise(apiMethod);
	}

	static insertCourseForUserGroup(userGroupId, course) {
		var apiMethod = gapi.client.qdacity.course.insertCourseForUserGroup({userGroupId: userGroupId}, course);
		return Promisizer.makePromise(apiMethod);
	}

	static removeUser(crsId, crsType) {
		var apiMethod = gapi.client.qdacity.course.removeUser({
			courseID: crsId,
			courseType: crsType
		});
		return Promisizer.makePromise(apiMethod);
	}

	static getCourse(crsID) {
		var apiMethod = gapi.client.qdacity.course.getCourse({
			id: crsID
		});
		return Promisizer.makePromise(apiMethod);
	}

	static getTermCourse(id) {
		var apiMethod = gapi.client.qdacity.course.getTermCourse({
			id: id
		});
		return Promisizer.makePromise(apiMethod);
	}

	static insertTermCourse(termCourse) {
		var apiMethod = gapi.client.qdacity.course.insertTermCourse(termCourse);
		return Promisizer.makePromise(apiMethod);
	}

	static insertTermCourseForUserGroup(userGroupId, termCourse) {
		var apiMethod = gapi.client.qdacity.course.insertTermCourseForUserGroup({userGroupId: userGroupId}, termCourse);
		return Promisizer.makePromise(apiMethod);
	}

	static removeTermCourse(Id) {
		var apiMethod = gapi.client.qdacity.course.removeTermCourse({
			id: Id
		});
		return Promisizer.makePromise(apiMethod);
	}

	static listTermCourse(templateCrsID) {
		var apiMethod = gapi.client.qdacity.course.listTermCourse({
			courseID: templateCrsID
		});
		return Promisizer.makePromise(apiMethod);
	}

	static listTermCourseByParticipant() {
		var apiMethod = gapi.client.qdacity.course.listTermCourseByParticipant();
		return Promisizer.makePromise(apiMethod);
	}

	static listTermCourseByUserGroupId(userGroupId) {
		var apiMethod = gapi.client.qdacity.course.listTermCourseByUserGroupId({userGroupId: userGroupId});
		return Promisizer.makePromise(apiMethod);
	}

	static listTermCourseParticipants(termCourseID) {
		var apiMethod = gapi.client.qdacity.course.listTermCourseParticipants({
			termCourseID: termCourseID
		});
		return Promisizer.makePromise(apiMethod);
	}

	static inviteUser(courseID, userEmail) {
		var apiMethod = gapi.client.qdacity.course.inviteUser({
			courseID: courseID,
			userEmail: userEmail
		});
		return Promisizer.makePromise(apiMethod);
	}

	static inviteUserTermCourse(termCourseID, userEmail) {
		var apiMethod = gapi.client.qdacity.course.inviteUserTermCourse({
			termCourseID: termCourseID,
			userEmail: userEmail
		});
		return Promisizer.makePromise(apiMethod);
	}

	static addCourseOwner(courseID) {
		var apiMethod = gapi.client.qdacity.course.addCourseOwner({
			courseID: courseID
		});
		return Promisizer.makePromise(apiMethod);
	}

	static setTermCourseStatus(termCourseID, status) {
		var apiMethod = gapi.client.qdacity.course.setTermCourseStatus({
			termCourseID: termCourseID,
			isOpen: status
		});
		return Promisizer.makePromise(apiMethod);
	}

	static addParticipant(termCourseID, userID) {
		var apiMethod = gapi.client.qdacity.course.addParticipant({
			id: termCourseID,
			userID: userID
		});
		return Promisizer.makePromise(apiMethod);
	}

	static removeParticipant(termCourseID, userID) {
		var apiMethod = gapi.client.qdacity.course.removeParticipant({
			id: termCourseID,
			userID: userID
		});
		return Promisizer.makePromise(apiMethod);
	}
}
