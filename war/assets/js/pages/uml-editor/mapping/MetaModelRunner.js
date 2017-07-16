import {
	EdgeType
} from '../EdgeType.js';
import {
	MappingAction
} from './MappingAction.js';

import MetaModelMapper from './MetaModelMapper.js';
import UmlEditor from '../UmlEditor.jsx';

export default class MetaModelMapper {

	constructor(umlGraphView, mmEntities) {
		this.umlEditor = umlEditor;
		this.metaModelMapper = metaModelMapper;
	}

	evaluateAndRunAction(sourceUmlClass, destinationUmlClass, relationMetaModelEntity) {
		const action = this.metaModelMapper.evaluateAction(sourceUmlClass, destinationUmlClass, relationMetaModelEntity);
		this.runAction(action, sourceUmlClass, destinationUmlClass, relationMetaModelEntity);
		return action;
	}

	runAction(action, sourceUmlClass, destinationUmlClass, relationMetaModelEntity) {
		switch (action) {
		case MappingAction.DO_NOTHING:
			{
				break;
			}
		case MappingAction.CREATE_NODE:
			{
				this.umlEditor.addNode(sourceUmlClass);
				break;
			}
		case MappingAction.CREATE_GENERALIZATION:
			{
				this.umlEditor.addEdge(sourceUmlClass, destinationUmlClass, relationMetaModelEntity, EdgeType.GENERALIZATION);
				break;
			}
		case MappingAction.CREATE_AGGREGATION:
			{
				this.umlEditor.addEdge(sourceUmlClass, destinationUmlClass, relationMetaModelEntity, EdgeType.AGGREGATION);
				break;
			}
		case MappingAction.CREATE_DIRECTED_ASSOCIATION:
			{
				this.umlEditor.addEdge(sourceUmlClass, destinationUmlClass, relationMetaModelEntity, EdgeType.DIRECTED_ASSOCIATION);
				break;
			}
		case MappingAction.ADD_CLASS_FIELD:
			{
				this.umlEditor.addClassField(sourceUmlClass, destinationUmlClass, relationMetaModelEntity);
				break;
			}
		case MappingAction.ADD_CLASS_METHOD:
			{
				this.umlEditor.addClassMethod(sourceUmlClass, destinationUmlClass, relationMetaModelEntity);
				break;
			}
		default:
			{
				throw new Error('Action not implemented');
			}
		}
	}

	undoAction(action, sourceUmlClass, destinationUmlClass, relationMetaModelEntity) {
		switch (action) {
		case MappingAction.DO_NOTHING:
			{
				break;
			}
		case MappingAction.CREATE_NODE:
			{
				this.umlEditor.undoAddNode(sourceUmlClass);
				break;
			}
		case MappingAction.CREATE_GENERALIZATION:
			{
				this.umlEditor.undoAddEdge(sourceUmlClass, destinationUmlClass, relationMetaModelEntity);
				break;
			}
		case MappingAction.CREATE_AGGREGATION:
			{
				this.umlEditor.undoAddEdge(sourceUmlClass, destinationUmlClass, relationMetaModelEntity);
				break;
			}
		case MappingAction.CREATE_DIRECTED_ASSOCIATION:
			{
				this.umlEditor.undoAddEdge(sourceUmlClass, destinationUmlClass, relationMetaModelEntity);
				break;
			}
		case MappingAction.ADD_CLASS_FIELD:
			{
				this.umlEditor.undoAddClassField(sourceUmlClass, destinationUmlClass, relationMetaModelEntity);
				break;
			}
		case MappingAction.ADD_CLASS_METHOD:
			{
				this.umlEditor.undoAddClassMethod(sourceUmlClass, destinationUmlClass, relationMetaModelEntity);
				break;
			}
		default:
			{
				throw new Error('Action not implemented');
			}
		}
	}

}