import Promisizer from './Promisizer'

export default class ExerciseEndpoint {
	constructor() {}

	static listTermCourseExercises(termCourseID) {
		var apiMethod = gapi.client.qdacity.exercise.listTermCourseExercises({
			'termCrsID': termCourseID
		});
		return Promisizer.makePromise(apiMethod);
	}

	static getExerciseProjectByRevisionID(revisionID) {
		var apiMethod = gapi.client.qdacity.exercise.getExerciseProjectByRevisionID({
			'revisionID': revisionID
		});
		return Promisizer.makePromise(apiMethod);
	}

	static addValidationCoder(exerciseProjectID) {
		var apiMethod = gapi.client.qdacity.exercise.addValidationCoder({
			'exerciseProjectID': exerciseProjectID
		});
		return Promisizer.makePromise(apiMethod);
	}

	static createExerciseProject(revisionID, exerciseID) {
		var apiMethod = gapi.client.qdacity.exercise.createExerciseProject({
			'revisionID': revisionID,
			'exerciseID': exerciseID
		});
		return Promisizer.makePromise(apiMethod);
	}

	static createExerciseProjectIfNeeded(revisionID, exerciseID) {
		var apiMethod = gapi.client.qdacity.exercise.createExerciseProjectIfNeeded({
			'revisionID': revisionID,
			'exerciseID': exerciseID
		});
		return Promisizer.makePromise(apiMethod);
	}

	static insertExercise(exercise) {
		var apiMethod = gapi.client.qdacity.exercise.insertExercise(exercise);
		return Promisizer.makePromise(apiMethod);
	}

	static removeExercise(ExerciseID) {
		var apiMethod = gapi.client.qdacity.exercise.removeExercise({
			'id': ExerciseID
		});
		return Promisizer.makePromise(apiMethod);
	}
}
