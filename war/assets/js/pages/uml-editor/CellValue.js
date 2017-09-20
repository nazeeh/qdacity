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

	addField(relationId, text) {
		this.fields.push({
			id: relationId,
			text: text
		});
	}

	removeField(relationId) {
		let index = this.fields.findIndex((field) => {
			return field.id == relationId;
		});

		if (index > -1) {
			this.fields.splice(index, 1);
		}
	}

	getMethods() {
		return this.methods;
	}

	addMethod(relationId, text) {
		this.methods.push({
			id: relationId,
			text: text
		});
	}

	removeMethod(relationId) {
		let index = this.methods.findIndex((method) => {
			return method.id == relationId;
		});

		if (index > -1) {
			this.methods.splice(index, 1);
		}
	}
}