import {
	EdgeType
} from '../EdgeType.js';
import {
	MappingAction
} from './MappingAction.js';

import MetaModelMapper from './MetaModelMapper.js';
import UmlEditor from '../UmlEditor.jsx';

export default class MetaModelMapper {

	constructor(umlEditor, metaModelMapper) {
		this.umlEditor = umlEditor;
		this.metaModelMapper = metaModelMapper;
	}

	evaluateAndRunAction(params) {
		const action = this.metaModelMapper.evaluateAction(params);
		this.runAction(action, params);
		return action;
	}

	runAction(action, params) {
		let umlClass, umlClassRelation = this.metaModelMapper.convertParams(params);

		switch (action) {
		case MappingAction.DO_NOTHING:
			{
				break;
			}
		case MappingAction.CREATE_NODE:
			{
				this.umlEditor.addNode(umlClass);
				break;
			}
		case MappingAction.CREATE_GENERALIZATION:
			{
				this.umlEditor.addEdge(umlClassRelation, this.metaModelMapper.getEdgeTypeFromMappingAction(action));
				break;
			}
		case MappingAction.CREATE_AGGREGATION:
			{
				this.umlEditor.addEdge(umlClassRelation, this.metaModelMapper.getEdgeTypeFromMappingAction(action));
				break;
			}
		case MappingAction.CREATE_DIRECTED_ASSOCIATION:
			{
				this.umlEditor.addEdge(umlClassRelation, this.metaModelMapper.getEdgeTypeFromMappingAction(action));
				break;
			}
		case MappingAction.ADD_CLASS_FIELD:
			{
				this.umlEditor.addClassField(umlClassRelation);
				break;
			}
		case MappingAction.ADD_CLASS_METHOD:
			{
				this.umlEditor.addClassMethod(umlClassRelation);
				break;
			}
		default:
			{
				throw new Error('Action not implemented');
			}
		}
	}

	undoAction(action, params) {
		let umlClass, umlClassRelation = this.metaModelMapper.convertParams(params);

		switch (action) {
		case MappingAction.DO_NOTHING:
			{
				break;
			}
		case MappingAction.CREATE_NODE:
			{
				this.umlEditor.undoAddNode(umlClass);
				break;
			}
		case MappingAction.CREATE_GENERALIZATION:
			{
				this.umlEditor.undoAddEdge(umlClassRelation);
				break;
			}
		case MappingAction.CREATE_AGGREGATION:
			{
				this.umlEditor.undoAddEdge(umlClassRelation);
				break;
			}
		case MappingAction.CREATE_DIRECTED_ASSOCIATION:
			{
				this.umlEditor.undoAddEdge(umlClassRelation);
				break;
			}
		case MappingAction.ADD_CLASS_FIELD:
			{
				this.umlEditor.undoAddClassField(umlClassRelation);
				break;
			}
		case MappingAction.ADD_CLASS_METHOD:
			{
				this.umlEditor.undoAddClassMethod(umlClassRelation);
				break;
			}
		default:
			{
				throw new Error('Action not implemented');
			}
		}
	}
}