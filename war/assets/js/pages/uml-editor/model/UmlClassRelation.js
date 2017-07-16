export default class UmlClassRelation {

	constructor(codeRelation, sourceUmlClass, destinationUmlClass, relationNode) {
		this.codeRelation = codeRelation;
		this.sourceUmlClass = sourceUmlClass;
		this.destinationUmlClass = destinationUmlClass;
		this.relationNode = relationNode;
	}

	getCodeRelation() {
		return this.codeRelation;
	}

	setCodeRelation(codeRelation) {
		this.codeRelation = codeRelation;
	}

	getSourceUmlClass() {
		return this.sourceUmlClass;
	}

	setSourceUmlClass(sourceUmlClass) {
		this.sourceUmlClass = sourceUmlClass;
	}

	getDestinationUmlClass() {
		return this.destinationUmlClass;
	}

	setDestinationUmlClass(destinationUmlClass) {
		this.destinationUmlClass = destinationUmlClass;
	}

	getRelationNode() {
		return this.relationNode;
	}

	setRelationNode(relationNode) {
		this.relationNode = relationNode;
	}
}