export default class UmlClassRelation {

	constructor(relationId, sourceUmlClass, destinationUmlClass, relationMetaModelEntity, relationNode) {
		this.relationId = relationId;

		this.sourceUmlClass = sourceUmlClass;
		this.destinationUmlClass = destinationUmlClass;

		this.relationMetaModelEntity = relationMetaModelEntity;

		this.relationNode = relationNode;
	}

	getRelationId() {
		return this.relationId;
	}

	setRelationId(relationId) {
		this.relationId = relationId;
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