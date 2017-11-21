import Promisizer from './Promisizer'

export default class ExerciseEndpoint {
	constructor() {}

	static listTermCourseExercises(termCourseID) {
		var apiMethod = gapi.client.qdacity.exercise.listTermCourseExercises({
			'termCrsID': termCourseID
		});
		return Promisizer.makePromise(apiMethod);
	}

	static insertCourse(termCourseID, name) {
		var apiMethod = gapi.client.qdacity.exercise.insertExercise({
			'termCrsID': termCourseID,
			'name': name
		});
		return Promisizer.makePromise(apiMethod);
	}
}
