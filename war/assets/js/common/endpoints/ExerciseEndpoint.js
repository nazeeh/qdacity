import Promisizer from './Promisizer';

export default class ExerciseEndpoint {
	constructor() {}

	static listTermCourseExercises(termCourseID) {
		var apiMethod = gapi.client.qdacity.exercise.listTermCourseExercises({
			termCrsID: termCourseID
		});
		return Promisizer.makePromise(apiMethod);
	}

	static getExerciseProjectByRevisionID(revisionID) {
		var apiMethod = gapi.client.qdacity.exercise.getExerciseProjectByRevisionID(
			{
				revisionID: revisionID
			}
		);
		return Promisizer.makePromise(apiMethod);
	}

	static getExerciseByID(exerciseID) {
		var apiMethod = gapi.client.qdacity.exercise.getExerciseByID({
			exerciseID: exerciseID
		});
		return Promisizer.makePromise(apiMethod);
	}

	static getExerciseProjectsByExerciseID(exerciseID) {
		var apiMethod = gapi.client.qdacity.exercise.getExerciseProjectsByExerciseID(
			{
				exerciseID: exerciseID
			}
		);
		return Promisizer.makePromise(apiMethod);
	}

	static createExerciseProjectIfNeeded(revisionID, exerciseID) {
		var apiMethod = gapi.client.qdacity.exercise.createExerciseProjectIfNeeded({
			revisionID: revisionID,
			exerciseID: exerciseID
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

	evaluateExerciseRevision(exerciseID, revId, name, docs, method, unit) {
		var apiMethod = gapi.client.qdacity.exercise.evaluateExerciseRevision({
			exerciseID: exerciseID,
			revisionID: revId,
			name: name,
			docs: docs,
			method: method,
			unit: unit
		});
		return Promisizer.makePromise(apiMethod);
	}

	static listExerciseReportsByRevisionID(revisionID, exerciseID) {
		var apiMethod = gapi.client.qdacity.exercise.listExerciseReportsByRevisionID(
			{
				revisionID: revisionID,
				exerciseID: exerciseID
			}
		);
		return Promisizer.makePromise(apiMethod);
	}

	static listExerciseResults(repId) {
		var apiMethod = gapi.client.qdacity.exercise.listExerciseResults({
			reportID: repId
		});
		return Promisizer.makePromise(apiMethod);
	}

	sendNotificationEmailExercise(reportID) {
		var apiMethod = gapi.client.qdacity.exercise.sendNotificationEmailExercise({
			reportID: reportID
		});
		return Promisizer.makePromise(apiMethod);
	}

	deleteExerciseProjectReport(repId) {
		var apiMethod = gapi.client.qdacity.exercise.deleteExerciseProjectReport({
			reportID: repId
		});
		return Promisizer.makePromise(apiMethod);
	}
}
