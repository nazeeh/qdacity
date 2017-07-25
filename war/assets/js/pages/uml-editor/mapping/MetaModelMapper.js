import {
	EdgeType
} from '../EdgeType.js';
import {
	MappingAction
} from './MappingAction.js';

export default class MetaModelMapper {

	constructor(umlEditor) {
		this.umlEditor = umlEditor;
	}

	evaluateAction(params) {
		const [umlClass, umlClassRelation] = this.convertParams(params);

		if (umlClass != null
			&& umlClassRelation == null) {
			return this.evaluateCode(umlClass);
		} else if (umlClass == null
			&& umlClassRelation != null) {
			return this.evaluateCodeRelation(umlClassRelation);
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

	evaluateCodeRelation(umlClassRelation) {
		let codeSource = umlClassRelation.getSourceUmlClass().getCode();
		let codeDestination = umlClassRelation.getDestinationUmlClass().getCode();

		switch (umlClassRelation.getRelationMetaModelEntity().name) {
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

	getEdgeTypeFromMappingAction(action) {
		switch (action) {
		case MappingAction.CREATE_GENERALIZATION:
			{
				return EdgeType.GENERALIZATION;
			}
		case MappingAction.CREATE_AGGREGATION:
			{
				return EdgeType.AGGREGATION;
			}
		case MappingAction.CREATE_DIRECTED_ASSOCIATION:
			{
				return EdgeType.DIRECTED_ASSOCIATION;
			}
		default:
			{
				throw new Error('Unsupported action ' + action);
			}
		}
	}

	convertParams(params) {
		let umlClass = params.hasOwnProperty('umlClass') ? params.umlClass : null;
		let umlClassRelation = params.hasOwnProperty('umlClassRelation') ? params.umlClassRelation : null;

		return [umlClass, umlClassRelation];
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
			var entity = this.umlEditor.getMetaModelEntities().find((e) => e.id == mmElementId);

			if (entity != null && entity.name == entityName) {
				return true;
			}
		}

		return false;
	}
}