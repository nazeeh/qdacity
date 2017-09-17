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

}
