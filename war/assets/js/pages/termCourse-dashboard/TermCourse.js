export default class TermCourse {
	constructor(termCourseId) {
		this.id = termCourseId;
		this.term = "";
		this.participants = [];
	}

	getId() {
		return this.id;
	}

	getTerm() {
		return this.term;
	}

	setTerm(term) {
		this.term = term;
	}

	getParticipants() {
		return this.participants;
	}

}