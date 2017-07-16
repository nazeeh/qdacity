export default class UmlClassRelation {

	constructor(sourceUmlClass, destinationUmlClass, relationMetaModelEntity, relationNode) {
		this.sourceUmlClass = sourceUmlClass;
		this.destinationUmlClass = destinationUmlClass;

		this.relationMetaModelEntity = relationMetaModelEntity;

		this.relationNode = relationNode;
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

	getRelationMetaModelEntity() {
		return this.relationMetaModelEntity;
	}

	setRelationMetaModelEntity(relationMetaModelEntity) {
		this.relationMetaModelEntity = relationMetaModelEntity;
	}

	getRelationNode() {
		return this.relationNode;
	}

	setRelationNode(relationNode) {
		this.relationNode = relationNode;
	}
}