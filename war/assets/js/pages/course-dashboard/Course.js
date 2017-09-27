export default class Course {
	constructor(crsId) {
		this.id = crsId;
		this.name = "";
		this.description = "";
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

	getDescription() {
		return this.description;
	}

	setDescription(desc) {
		this.description = desc;
	}

}
