export default class UmlClass {

	constructor(code, node, umlCodePosition) {
		// The code object from the database
		this.code = code;

		// Saves the state of a code before the latest change
		this.previousCode = {
			mmElementIDs: code.mmElementIDs != null ? code.mmElementIDs.slice() : [] // copy
		};

		// The node object from the graph
		this.node = node;

		// Saves the position in the graph
		this.umlCodePosition = umlCodePosition;
	}

	getCode() {
		return this.code;
	}

	setCode(code) {
		this.code = code;
	}

	getPreviousCode() {
		return this.previousCode;
	}

	setPreviousCode(previousCode) {
		this.previousCode = previousCode;
	}

	getNode() {
		return this.node;
	}

	setNode(node) {
		this.node = node;
	}

	getUmlCodePosition() {
		return this.umlCodePosition;
	}

	setUmlCodePosition(umlCodePosition) {
		this.umlCodePosition = umlCodePosition;
	}
}