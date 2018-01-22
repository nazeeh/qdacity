export default class CellValue {
	constructor() {
		this.codeId = null;

		this.header = '';

		this.fields = [];

		this.methods = [];
	}

	getCodeId() {
		return this.codeId;
	}

	setCodeId(codeId) {
		this.codeId = codeId;
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

	addField(relationId, accessibility, text) {
		this.fields.push(new ClassElement(relationId, accessibility, text));
	}

	removeField(relationId) {
		this.removeElementByRelationId(this.fields, relationId);
	}

	getMethods() {
		return this.methods;
	}

	addMethod(relationId, accessibility, text) {
		this.methods.push(new ClassElement(relationId, accessibility, text));
	}

	removeMethod(relationId) {
		this.removeElementByRelationId(this.methods, relationId);
	}

	removeElementByRelationId(arr, relationId) {
		let index = arr.findIndex(element => {
			return element.getRelationId() == relationId;
		});

		if (index > -1) {
			arr.splice(index, 1);
		}
	}
}

class ClassElement {
	constructor(relationId, accessibility, text) {
		this.text = text;
		this.accessibility = accessibility;
		this.relationId = relationId;
	}

	getText() {
		return this.text;
	}

	setText(text) {
		this.text = text;
	}

	getAccessibility() {
		return this.accessibility;
	}

	setAccessibility(accessibility) {
		this.accessibility = accessibility;
	}

	getRelationId() {
		return this.relationId;
	}

	setRelationId(relationId) {
		this.relationId = relationId;
	}
}
