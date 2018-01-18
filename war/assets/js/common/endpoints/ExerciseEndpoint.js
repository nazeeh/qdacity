import Promisizer from './Promisizer';

export default class ExerciseEndpoint {
	constructor() {}

	static listTermCourseExercises(termCourseID) {
		var apiMethod = gapi.client.qdacity.exercise.listTermCourseExercises({
			termCrsID: termCourseID
		});
		return Promisizer.makePromise(apiMethod);
	}

	static insertExercise(exercise) {
		var apiMethod = gapi.client.qdacity.exercise.insertExercise(exercise);
		return Promisizer.makePromise(apiMethod);
	}

	static removeExercise(ExerciseID) {
		var apiMethod = gapi.client.qdacity.exercise.removeExercise({
			id: ExerciseID
		});
		return Promisizer.makePromise(apiMethod);
	}
}
