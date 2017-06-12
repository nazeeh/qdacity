export default class UmlClass {

	constructor(code, node) {
		// The code object from the database
		this.code = code;

		// The node object from the graph
		this.node = node;
		
		// Saves the position in the graph
		this.umlCodePosition;
	}

	getCode() {
		return this.code;
	}

	setCode(code) {
		this.code = code;
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