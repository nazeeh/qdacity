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

	getFields() {
		return this.fields;
	}

	addField(field) {
		this.fields.push(field);
	}

	removeField(field) {
		this.fields.remove(field);
	}

	getMethods() {
		return this.methods;
	}

	addMethod(method) {
		this.methods.push(method);
	}

	removeMethod(method) {
		this.methods.remove(method);
	}
}