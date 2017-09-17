import Promisizer from './Promisizer'

export default class CourseEndpoint {
	constructor() {}

	static listCourse() {
		var apiMethod = gapi.client.qdacity.course.listCourse();
		return Promisizer.makePromise(apiMethod);
	}

}