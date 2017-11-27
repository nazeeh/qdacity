import Promisizer from './Promisizer'

export default class ExerciseEndpoint {
	constructor() {}

	static listTermCourseExercises(termCourseID) {
		var apiMethod = gapi.client.qdacity.exercise.listTermCourseExercises({
			'termCrsID': termCourseID
		});
		return Promisizer.makePromise(apiMethod);
	}

	static insertExercise(termCourseID, exercise) {
		var apiMethod = gapi.client.qdacity.exercise.insertExercise({
			'termCrsID': termCourseID,
			'exercise': exercise
		});
		return Promisizer.makePromise(apiMethod);
	}
}
