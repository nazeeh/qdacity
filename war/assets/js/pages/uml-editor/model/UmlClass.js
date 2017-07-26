export default class UmlClass {

	constructor(code, node, umlCodePosition) {
		// The code object from the database
		this.code = code;

		// Saves the state of a code before the latest change
		this.setPreviousCode(
			code.mmElementIDs != null ? code.mmElementIDs.slice() : [], // copy
			code.relations != null ? code.relations.map(relation => Object.assign({}, relation)) : [] // copy
		);

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

	setPreviousCode(mmElementIDs, relations) {
		this.previousCode = {
			mmElementIDs: mmElementIDs,
			relations: relations
		};
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