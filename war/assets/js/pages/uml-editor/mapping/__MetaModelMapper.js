import {
	EdgeType
} from '../util/EdgeType.js';
import {
	MappingAction
} from './MappingAction.js';

export default class __MetaModelMapper {

	constructor(umlEditor) {
		this.umlEditor = umlEditor;
	}

	evaluateCode(code) {
		if (this.isCodeValidNode(code)) {
			return MappingAction.CREATE_NODE;
		}

		return MappingAction.DO_NOTHING;
	}

	evaluateCodeRelation(sourceCode, destinationCode, relation) {
		const mmElementId = relation.mmElementId;
		const mmElementName = this.umlEditor.getMetaModelEntityById(mmElementId).name;

		switch (mmElementName) {
		case 'is a':
			{
				if (!this.isCodeValidNode(sourceCode) || !this.isCodeValidNode(destinationCode)) {
					return MappingAction.DO_NOTHING;
				}

				return MappingAction.CREATE_GENERALIZATION;
			}
		case 'is part of':
			{
				if (!this.isCodeValidNode(sourceCode) || !this.isCodeValidNode(destinationCode)) {
					return MappingAction.DO_NOTHING;
				}

				return MappingAction.CREATE_AGGREGATION;
			}
		case 'is related to':
			{
				if (this.codeHasMetaModelEntity(destinationCode, 'Object')
					|| this.codeHasMetaModelEntity(destinationCode, 'Actor')
					|| this.codeHasMetaModelEntity(destinationCode, 'Place')) {

					if (this.isCodeValidNode(sourceCode) && this.codeHasMetaModelEntity(destinationCode, 'Property')) {
						return MappingAction.ADD_CLASS_FIELD;
					}
				}

				if (!this.isCodeValidNode(sourceCode) || !this.isCodeValidNode(destinationCode)) {
					return MappingAction.DO_NOTHING;
				}

				return MappingAction.CREATE_DIRECTED_ASSOCIATION;
			}
		case 'influences':
			{
				if (this.isCodeValidNode(sourceCode) && this.codeHasMetaModelEntity(destinationCode, 'Property')) {
					return MappingAction.ADD_CLASS_METHOD;
				}
			}
		}

		return MappingAction.DO_NOTHING;
	}

	isCodeValidNode(code) {
		return this.codeHasMetaModelEntity(code, 'Category') || this.codeHasMetaModelEntity(code, 'Concept');
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

	getDefaultUmlClassMetaModelName() {
		return 'Concept';
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

	getClassFieldText(fieldName, fieldReturnType) {
		return fieldName + ': ' + fieldReturnType;
	}

	getClassMethodText(methodName, methodReturnType, methodArguments) {
		if (methodArguments == null) {
			methodArguments = [];
		}

		return methodName + '(' + methodArguments.join(', ') + '): ' + methodReturnType;
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