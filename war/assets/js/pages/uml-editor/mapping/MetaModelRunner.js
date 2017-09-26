import {
	EdgeType
} from '../EdgeType.js';
import {
	MappingAction
} from './MappingAction.js';

import MetaModelMapper from './MetaModelMapper.js';
import UmlEditor from '../UmlEditor.jsx';

export default class MetaModelRunner {

	constructor(umlEditor, metaModelMapper) {
		this.umlEditor = umlEditor;
		this.metaModelMapper = metaModelMapper;
	}

	evaluateAndRunCode(code) {
		const action = this.metaModelMapper.evaluateCode(code);
		this.runCode(action, code);
		return action;
	}

	evaluateAndRunCodeRelation(sourceCode, destinationCode, relation) {
		const action = this.metaModelMapper.evaluateCodeRelation(sourceCode, destinationCode, relation);
		this.runCodeRelation(action, sourceCode, destinationCode, relation);
		return action;
	}

	runCode(action, code) {
		switch (action) {
		case MappingAction.DO_NOTHING:
			{
				break;
			}
		case MappingAction.CREATE_NODE:
			{
				this.umlEditor.addNode(code);
				break;
			}
		default:
			{
				throw new Error('Action ' + action + ' not supported');
			}
		}
	}

	runCodeRelation(action, sourceCode, destinationCode, relation) {
		switch (action) {
		case MappingAction.DO_NOTHING:
			{
				break;
			}
		case MappingAction.CREATE_GENERALIZATION:
			{
				this.umlEditor.addEdge(sourceCode, destinationCode, relation, this.metaModelMapper.getEdgeTypeFromMappingAction(action));
				break;
			}
		case MappingAction.CREATE_AGGREGATION:
			{
				this.umlEditor.addEdge(sourceCode, destinationCode, relation, this.metaModelMapper.getEdgeTypeFromMappingAction(action));
				break;
			}
		case MappingAction.CREATE_DIRECTED_ASSOCIATION:
			{
				this.umlEditor.addEdge(sourceCode, destinationCode, relation, this.metaModelMapper.getEdgeTypeFromMappingAction(action));
				break;
			}
		case MappingAction.ADD_CLASS_FIELD:
			{
				this.umlEditor.addClassField(sourceCode, destinationCode, relation);
				break;
			}
		case MappingAction.ADD_CLASS_METHOD:
			{
				this.umlEditor.addClassMethod(sourceCode, destinationCode, relation);
				break;
			}
		default:
			{
				throw new Error('Action ' + action + ' not supported');
			}
		}
	}

	evaluateAndUndoCode(code) {
		const action = this.metaModelMapper.evaluateCode(params);
		this.undoCode(action, params);
		return action;
	}

	evaluateAndUndoCodeRelation(sourceCode, destinationCode, relation) {
		const action = this.metaModelMapper.evaluateCodeRelation(sourceCode, destinationCode, relation);
		this.undoCodeRelation(action, sourceCode, destinationCode, relation);
		return action;
	}

	undoCode(action, code) {
		switch (action) {
		case MappingAction.DO_NOTHING:
			{
				break;
			}
		case MappingAction.CREATE_NODE:
			{
				this.umlEditor.removeNode(code);
				break;
			}
		default:
			{
				throw new Error('Action ' + action + ' not supported');
			}
		}
	}

	undoCodeRelation(action, sourceCode, destinationCode, relation) {
		switch (action) {
		case MappingAction.DO_NOTHING:
			{
				break;
			}
		case MappingAction.CREATE_GENERALIZATION:
		case MappingAction.CREATE_AGGREGATION:
		case MappingAction.CREATE_DIRECTED_ASSOCIATION:
			{
				this.umlEditor.removeEdge(sourceCode, relation);
				break;
			}
		case MappingAction.ADD_CLASS_FIELD:
			{
				this.umlEditor.removeClassField(sourceCode, relation);
				break;
			}
		case MappingAction.ADD_CLASS_METHOD:
			{
				this.umlEditor.removeClassMethod(sourceCode, relation);
				break;
			}
		default:
			{
				throw new Error('Action ' + action + ' not supported');
			}
		}
	}
}