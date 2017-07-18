export default class UmlClassRelation {

	constructor() {
		this.umlClassRelations = [];
	}

	size() {
		return this.umlClassRelations.length;
	}

	getAll() {
		return this.umlClassRelations;
	}

	get(sourceUmlClass, destinationUmlClass, relationMetaModelEntity) {
		return this.umlClassRelations.find((umlClassRelation) => {
			return umlClassRelation.getRelationMetaModelEntity().name == relationMetaModelEntity.name
				&& umlClassRelation.getSourceUmlClass().getCode().codeID == sourceUmlClass.getCode().codeID
				&& umlClassRelation.getDestinationUmlClass().getCode().codeID == destinationUmlClass.getCode().codeID;
		});
	}

	add(umlClassRelation) {
		this.umlClassRelations.push(umlClassRelation);
	}
}