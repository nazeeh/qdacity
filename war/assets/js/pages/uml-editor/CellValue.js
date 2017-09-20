export default class CellValue {

	constructor() {
		this.header = new Text("", 1);

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

	addField(text, numberOfLines, relationId) {
		this.fields.push(new ClassElement(text, numberOfLines, relationId));
	}

	removeField(relationId) {
		this.removeElementByRelationId(this.fields, relationId);
	}

	getMethods() {
		return this.methods;
	}

	addMethod(text, numberOfLines, relationId) {
		this.methods.push(new ClassElement(text, numberOfLines, relationId));
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

class Text {

	constructor(text, numberOfLines) {
		this.text = text;
		this.numberOfLines = numberOfLines;
	}

	getText() {
		return this.text;
	}

	setText(text) {
		this.text = text;
	}

	getNumberOfLines() {
		return this.numberOfLines;
	}

	setNumberOfLines(numberOfLines) {
		this.numberOfLines = numberOfLines;
	}
}

class ClassElement extends Text {

	constructor(text, numberOfLines, relationId) {
		super(text, numberOfLines);

		this.relationId = relationId;
	}

	getRelationId() {
		return this.relationId;
	}

	setRelationId(relationId) {
		this.relationId = relationId;
	}
}