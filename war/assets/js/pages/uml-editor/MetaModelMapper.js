import {
	EdgeType
} from './EdgeType.js';
import UmlClassRelation from './UmlClassRelation.js';

import CodesEndpoint from '../../common/endpoints/CodesEndpoint';

export const Action = {
	DO_NOTHING: 0,
	CREATE_NODE: 1,
	CREATE_GENERALIZATION: 2,
	CREATE_AGGREGATION: 3,
	CREATE_DIRECTED_ASSOCIATION: 4,
	ADD_CLASS_FIELD: 5,
	ADD_CLASS_METHOD: 6
};

export default class MetaModelMapper {

	constructor(umlEditorView, mmEntities) {
		this.umlEditorView = umlEditorView;
		this.mmEntities = mmEntities;
	}

	evaluateAction(params) {
		if (params.hasOwnProperty('sourceUmlClass')
			&& !params.hasOwnProperty('destinationUmlClass')) {
			return this.evaluateCode(params.sourceUmlClass);
		} else if (params.hasOwnProperty('sourceUmlClass')
			&& params.hasOwnProperty('destinationUmlClass')
			&& params.hasOwnProperty('relationMetaModelEntity')
			&& params.hasOwnProperty('relation')) {
			return this.evaluateCodeRelation(params.relationMetaModelEntity, params.sourceUmlClass, params.destinationUmlClass);
		} else {
			throw new Error('Invalid parameters');
		}
	}

	evaluateCode(umlClass) {
		if (this.codeIsValidNode(umlClass.getCode())) {
			return Action.CREATE_NODE;
		}

		return Action.DO_NOTHING;
	}

	evaluateCodeRelation(relationMetaModelEntity, sourceUmlClass, destinationUmlClass) {
		let codeSource = sourceUmlClass.getCode();
		let codeDestination = destinationUmlClass.getCode();

		switch (relationMetaModelEntity.name) {
		case 'is a':
			{
				if (!this.areBothCodesValidNodes(codeSource, codeDestination)) {
					return Action.DO_NOTHING;
				}

				return Action.CREATE_GENERALIZATION;
			}
		case 'is part of':
			{
				if (!this.areBothCodesValidNodes(codeSource, codeDestination)) {
					return Action.DO_NOTHING;
				}

				return Action.CREATE_AGGREGATION;
			}
		case 'is related to':
			{
				if (this.codeHasMetaModelEntity(codeDestination, 'Object')
					|| this.codeHasMetaModelEntity(codeDestination, 'Actor')
					|| this.codeHasMetaModelEntity(codeDestination, 'Place')) {

					if (this.codeIsValidNode(codeSource)) {
						return Action.ADD_CLASS_FIELD;
					}
				}

				if (!this.areBothCodesValidNodes(codeSource, codeDestination)) {
					return Action.DO_NOTHING;
				}

				return Action.CREATE_DIRECTED_ASSOCIATION;
			}
		case 'influences':
			{
				if (!this.codeIsValidNode(codeSource)) {
					return Action.DO_NOTHING;
				}

				return Action.ADD_CLASS_METHOD;
			}
		}

		return Action.DO_NOTHING;
	}

	runAction(action, params) {
		let sourceUmlClass = params.hasOwnProperty('sourceUmlClass') ? params.sourceUmlClass : null;
		let destinationUmlClass = params.hasOwnProperty('destinationUmlClass') ? params.destinationUmlClass : null;

		switch (action) {
		case Action.DO_NOTHING:
			{
				break;
			}
		case Action.CREATE_NODE:
			{
				this.addNode(sourceUmlClass);
				break;
			}
		case Action.CREATE_GENERALIZATION:
			{
				this.addEdge(params.relation, sourceUmlClass, destinationUmlClass, EdgeType.GENERALIZATION);
				break;
			}
		case Action.CREATE_AGGREGATION:
			{
				this.addEdge(params.relation, sourceUmlClass, destinationUmlClass, EdgeType.AGGREGATION);
				break;
			}
		case Action.CREATE_DIRECTED_ASSOCIATION:
			{
				this.addEdge(params.relation, sourceUmlClass, destinationUmlClass, EdgeType.DIRECTED_ASSOCIATION);
				break;
			}
		case Action.ADD_CLASS_FIELD:
			{
				this.addClassField(params.relation, sourceUmlClass, destinationUmlClass);
				break;
			}
		case Action.ADD_CLASS_METHOD:
			{
				this.addClassMethod(params.relation, sourceUmlClass, destinationUmlClass);
				break;
			}
		default:
			{
				throw new Error('Action not implemented');
			}
		}
	}

	addNode(umlClass) {
		const node = this.umlEditorView.addNode(umlClass.getCode().name);
		umlClass.setNode(node);

		const umlCodePosition = umlClass.getUmlCodePosition();
		if (umlCodePosition != null) {
			this.umlEditorView.translateNode(node, umlCodePosition.x, umlCodePosition.y);
		}

		this.umlEditorView.onNodesChanged();
	}

	addEdge(relation, sourceUmlClass, destinationUmlClass, edgeType) {
		const relationNode = this.umlEditorView.addEdge(sourceUmlClass.getNode(), destinationUmlClass.getNode(), edgeType);
		this.addRelation(relation, sourceUmlClass, destinationUmlClass, relationNode);
	}

	addClassField(relation, sourceUmlClass, destinationUmlClass) {
		const relationNode = this.umlEditorView.addClassField(sourceUmlClass.getNode(), '+ ' + destinationUmlClass.getCode().name + ': type');
		this.addRelation(relation, sourceUmlClass, destinationUmlClass, relationNode);
	}

	addClassMethod(relation, sourceUmlClass, destinationUmlClass) {
		const relationNode = this.umlEditorView.addClassMethod(sourceUmlClass.getNode(), '+ ' + destinationUmlClass.getCode().name + '(type): type');
		this.addRelation(relation, sourceUmlClass, destinationUmlClass, relationNode);
	}

	// TODO this does NOT belong here
	calculateRelationIdentifier(relation) {
		return relation.destination + '--' + relation.source + '--' + relation.metaModelEntityId;
	}

	// TODO this does MAYBE not belong here
	addRelation(relation, sourceUmlClass, destinationUmlClass, relationNode) {
		// TODO debug here with console.log
		// Warum wird 2-2-XXXXXXXXXXX nciht hinzugefügt?
		console.log("Add Relation for: " + this.calculateRelationIdentifier(relation));

		this.umlEditorView.umlClassRelations[this.calculateRelationIdentifier(relation)] = new UmlClassRelation(relation, sourceUmlClass, destinationUmlClass, relationNode);
	}


	undoAction(action, params) {
		let sourceUmlClass = params.hasOwnProperty('sourceUmlClass') ? params.sourceUmlClass : null;
		let destinationUmlClass = params.hasOwnProperty('destinationUmlClass') ? params.destinationUmlClass : null;
		let relation = params.hasOwnProperty('relation') ? params.relation : null;

		switch (action) {
		case Action.DO_NOTHING:
			{
				break;
			}
		case Action.CREATE_NODE:
			{
				this.undoAddNode(sourceUmlClass);
				break;
			}
		case Action.CREATE_GENERALIZATION:
			{
				this.undoAddEdge(relation);
				break;
			}
		case Action.CREATE_AGGREGATION:
			{
				this.undoAddEdge(relation);
				break;
			}
		case Action.CREATE_DIRECTED_ASSOCIATION:
			{
				this.undoAddEdge(relation);
				break;
			}
		case Action.ADD_CLASS_FIELD:
			{
				this.undoAddClassField(relation);
				break;
			}
		case Action.ADD_CLASS_METHOD:
			{
				this.undoAddClassMethod(relation);
				break;
			}
		default:
			{
				throw new Error('Action not implemented');
			}
		}
	}

	undoAddNode(umlClass) {
		this.umlEditorView.removeNode(umlClass.getNode());
		umlClass.setNode(null);
		this.umlEditorView.onNodesChanged();
	}

	undoAddEdge(relation) {
		this.undoRelation(relation);
	}

	undoAddClassField(relation) {
		this.undoRelation(relation);
	}

	undoAddClassMethod(relation) {
		this.undoRelation(relation);
	}

	undoRelation(relation) {
		const relationIdentifier = this.calculateRelationIdentifier(relation);

		this.umlEditorView.removeEdge(this.umlEditorView.umlClassRelations[relationIdentifier].getRelationNode());

		delete this.umlEditorView.umlClassRelations[relationIdentifier];
	}


	evaluateAndRunAction(params) {
		const action = this.evaluateAction(params);
		this.runAction(action, params);
		return action;
	}

	areBothCodesValidNodes(codeSource, codeDestination) {
		return this.codeIsValidNode(codeSource) && this.codeIsValidNode(codeDestination);
	}

	codeIsValidNode(code) {
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

	getMetaModelEntityId(name) {
		const mmEntity = this.mmEntities.find((mmEntity) => mmEntity.name == name);
		return mmEntity.id;
	}

	addedEdge(edge, edgeType, sourceUmlClass, destinationUmlClass) {
		const _this = this;

		let metaModelEntityName;

		switch (edgeType) {
		case EdgeType.GENERALIZATION:
			{
				metaModelEntityName = this.getMetaModelEntityId('is a');
				break;
			}
		case EdgeType.AGGREGATION:
			{
				metaModelEntityName = this.getMetaModelEntityId('is part of');
				break;
			}
		case EdgeType.DIRECTED_ASSOCIATION:
			{
				metaModelEntityName = this.getMetaModelEntityId('is related to');
				break;
			}
		default:
			{
				throw new Error('EdgeType not implemented.');
			}
		}

		this.addedRelation('edge', metaModelEntityName, edge, sourceUmlClass, destinationUmlClass);
	}

	addedField(fieldNode, sourceUmlClass, destinationUmlClass) {
		// Validate
		// TODO handle this in another way
		const destinationCode = destinationUmlClass.getCode();
		
		if (!this.codeHasMetaModelEntity(destinationCode, 'Object')
				&& !this.codeHasMetaModelEntity(destinationCode, 'Actor')
				&& !this.codeHasMetaModelEntity(destinationCode, 'Place')) {
			alert('ERROR: Cant add a field if the destination code is an uml class.');
			return;
		}

		this.addedRelation('field', 'is related to', fieldNode, sourceUmlClass, destinationUmlClass);
	}
	
	addedMethod(methodNode, sourceUmlClass, destinationUmlClass) {
		// Validate
		// TODO handle this in another way
		if (this.codeIsValidNode(destinationUmlClass.getCode())) {
			alert('ERROR: Cant add a method if the destination code is an uml class.');
			return;
		}

		this.addedRelation('method', 'influences', methodNode, sourceUmlClass, destinationUmlClass);
	}

	addedRelation(type, metaModelEntityName, relationNode, sourceUmlClass, destinationUmlClass) {
		const _this = this;

		let metaModelElementId = this.getMetaModelEntityId(metaModelEntityName);

		console.log('Adding new ' + type + '...');

		CodesEndpoint.addRelationship(sourceUmlClass.getCode().id, destinationUmlClass.getCode().codeID, metaModelElementId).then(function (resp) {
			let relation = {
				'source': sourceUmlClass.getCode().codeID,
				'destination': destinationUmlClass.getCode().codeID,
				'metaModelEntityId': metaModelElementId
			};

			_this.addRelation(relation, sourceUmlClass, destinationUmlClass, relationNode);

			console.log('Added new ' + type + '.');
		});
	}
}