import {
	EdgeType
} from '../EdgeType.js';
import {
	MappingAction
} from './MappingAction.js';

export default class MetaModelMapper {

	constructor() {

	}

	evaluateAction(sourceUmlClass, destinationUmlClass, relationMetaModelEntity) {
		if (sourceUmlClass != null
			&& destinationUmlClass == null
			&& relationMetaModelEntity == null) {
			return this.evaluateCode(sourceUmlClass);
		} else if (sourceUmlClass != null
			&& destinationUmlClass != null
			&& relationMetaModelEntity != null) {
			return this.evaluateCodeRelation(sourceUmlClass, destinationUmlClass, relationMetaModelEntity);
		} else {
			throw new Error('Invalid parameters');
		}
	}

	evaluateCode(umlClass) {
		if (this.isCodeValidNode(umlClass.getCode())) {
			return MappingAction.CREATE_NODE;
		}

		return MappingAction.DO_NOTHING;
	}

	evaluateCodeRelation(sourceUmlClass, destinationUmlClass, relationMetaModelEntity) {
		let codeSource = sourceUmlClass.getCode();
		let codeDestination = destinationUmlClass.getCode();

		switch (relationMetaModelEntity.name) {
		case 'is a':
			{
				if (!this.isCodeValidNode(codeSource) || !this.isCodeValidNode(codeDestination)) {
					return MappingAction.DO_NOTHING;
				}

				return MappingAction.CREATE_GENERALIZATION;
			}
		case 'is part of':
			{
				if (!this.isCodeValidNode(codeSource) || !this.isCodeValidNode(codeDestination)) {
					return MappingAction.DO_NOTHING;
				}

				return MappingAction.CREATE_AGGREGATION;
			}
		case 'is related to':
			{
				if (this.codeHasMetaModelEntity(codeDestination, 'Object')
					|| this.codeHasMetaModelEntity(codeDestination, 'Actor')
					|| this.codeHasMetaModelEntity(codeDestination, 'Place')) {

					if (this.isCodeValidNode(codeSource)) {
						return MappingAction.ADD_CLASS_FIELD;
					}
				}

				if (!this.isCodeValidNode(codeSource) || !this.isCodeValidNode(codeDestination)) {
					return MappingAction.DO_NOTHING;
				}

				return MappingAction.CREATE_DIRECTED_ASSOCIATION;
			}
		case 'influences':
			{
				if (!this.isCodeValidNode(codeSource)) {
					return MappingAction.DO_NOTHING;
				}

				return MappingAction.ADD_CLASS_METHOD;
			}
		}

		return MappingAction.DO_NOTHING;
	}

	getEdgeRelationEntityName(edgeType) {
		switch (edgeType) {
		case EdgeType.GENERALIZATION:
			{
				return 'is a';
			}
		case EdgeType.AGGREGATION:
			{
				return 'is part of';
			}
		case EdgeType.DIRECTED_ASSOCIATION:
			{
				return 'is related to';
			}
		default:
			{
				throw new Error('EdgeType not implemented.');
			}
		}
	}

	getClassFieldRelationEntityName() {
		return 'is related to';
	}

	getClassMethodRelationEntityName() {
		return 'influences';
	}

	isCodeValidNode(code) {
		return this.codeHasMetaModelEntity(code, 'Category') || this.codeHasMetaModelEntity(code, 'Concept');
	}

	codeHasMetaModelEntity(code, entityName) {
		if (!code) {
			throw new Error('Code must not be null or undefined');
		}

		for (let mmElementIdKey in code.mmElementIDs) {
			let mmElementId = code.mmElementIDs[mmElementIdKey];
			var entity = this.mmEntities.find((e) => e.id == mmElementId);

			if (entity != null && entity.name == entityName) {
				return true;
			}
		}

		return false;
	}
}