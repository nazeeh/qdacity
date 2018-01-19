export default class Course {
	constructor(crsId) {
		this.id = crsId;
		this.name = '';
		this.description = '';
		this.terms = [];
	}

	getId() {
		return this.id;
	}

	getName() {
		return this.name;
	}

	setName(name) {
		this.name = name;
	}

	setTerms(terms) {
		this.terms = terms;
	}
	getDescription() {
		return this.description;
	}

	setDescription(desc) {
		this.description = desc;
	}
}
