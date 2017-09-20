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
	
	static insertTermCourse(templateCrsID, term) 
	{
		
		var apiMethod = gapi.client.qdacity.course.insertTermCourse({
			'templateCourseID': templateCrsID,
			'courseTerm': term
		});
		return Promisizer.makePromise(apiMethod);
	}
}
