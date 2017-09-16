export default class CellValue {

	constructor() {
		this.name = "";

		this.fields = [];

		this.methods = [];
	}

	getName() {
		return this.name;
	}

	setName(name) {
		this.name = name;
	}

	addField(field) {
		this.fields.push(field);
	}

	getFields() {
		return this.fields;
	}

	addMethod(method) {
		this.methods.push(method);
	}

	getMethods() {
		return this.methods;
	}
}