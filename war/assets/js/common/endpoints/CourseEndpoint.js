import Promisizer from './Promisizer'

export default class CourseEndpoint {
	constructor() {}

	static listCourse() {
		var apiMethod = gapi.client.qdacity.course.listCourse();
		return Promisizer.makePromise(apiMethod);
	}

	static removeCourse(crsId) {
		var apiMethod = gapi.client.qdacity.course.removeCourse({
			'id': crsId
		});
		return Promisizer.makePromise(apiMethod);
	}

	static insertCourse(course) {
		var apiMethod = gapi.client.qdacity.course.insertCourse(course);
		return Promisizer.makePromise(apiMethod);
	}

	static removeUser(crsId, crsType) {
		var apiMethod = gapi.client.qdacity.course.removeUser({
			'courseID': crsId,
			'courseType': crsType
		});
		return Promisizer.makePromise(apiMethod);
	}

	static getCourse(crsID) {
		var apiMethod = gapi.client.qdacity.course.getCourse({
			'id': crsID,
		});
		return Promisizer.makePromise(apiMethod);
	}

	static insertTermCourse(CourseID, term)
	{

		var apiMethod = gapi.client.qdacity.course.insertTermCourse({
			'CourseID': CourseID,
			'courseTerm': term
		});
		return Promisizer.makePromise(apiMethod);
	}

	static listTermCourse(templateCrsID) {
		var apiMethod = gapi.client.qdacity.course.listTermCourse({
			'courseID': templateCrsID
		});
		return Promisizer.makePromise(apiMethod);
	}

	static getTermsCourse(crsID) {
		var apiMethod = gapi.client.qdacity.course.getTermsCourse({
			'courseID': crsID,
		});
		return Promisizer.makePromise(apiMethod);
	}
}
