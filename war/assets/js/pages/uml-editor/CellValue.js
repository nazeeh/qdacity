export default class CellValue {

	constructor() {
		this.header = ""

		this.fields = [];

		this.methods = [];
	}

	getHeader() {
		return this.header;
	}

	setHeader(header) {
		this.header = header;
	}

	getFields() {
		return this.fields;
	}

	addField(text, relationId) {
		this.fields.push(new ClassElement(text, relationId));
	}

	removeField(relationId) {
		this.removeElementByRelationId(this.fields, relationId);
	}

	getMethods() {
		return this.methods;
	}

	addMethod(text, relationId) {
		this.methods.push(new ClassElement(text, relationId));
	}

	removeMethod(relationId) {
		this.removeElementByRelationId(this.methods, relationId);
	}

	removeElementByRelationId(arr, relationId) {
		let index = arr.findIndex((element) => {
			return element.getRelationId() == relationId;
		});

		if (index > -1) {
			arr.splice(index, 1);
		}
	}
}

class ClassElement {

	constructor(text, relationId) {
		this.text = text;
		this.relationId = relationId;
	}

	getText() {
		return this.text;
	}

	setText(text) {
		this.text = text;
	}

	getRelationId() {
		return this.relationId;
	}

	setRelationId(relationId) {
		this.relationId = relationId;
	}
}