import React from 'react';
import styled from 'styled-components';

import ConsistencyManager from './ConsistencyManager.js';

import {
	MappingAction
} from './mapping/MappingAction.js';
import MetaModelMapper from './mapping/MetaModelMapper.js';
import MetaModelRunner from './mapping/MetaModelRunner.js';

import Toolbar from './toolbar/Toolbar.jsx';
import UmlGraphView from './UmlGraphView.jsx';

import UmlCodePropertyModal from '../../common/modals/UmlCodePropertyModal';

import CodesEndpoint from '../../common/endpoints/CodesEndpoint';
import MetaModelEntityEndpoint from '../../common/endpoints/MetaModelEntityEndpoint';
import MetaModelRelationEndpoint from '../../common/endpoints/MetaModelRelationEndpoint';
import UmlCodePositionEndpoint from '../../common/endpoints/UmlCodePositionEndpoint';

const StyledUmlEditor = styled.div `
    height: inherit;
    border-left: 1px solid #B0B0B0;
`;

export default class UmlEditor extends React.Component {

	constructor(props) {
		super(props);

		this.initialized = false;

		this.umlGraphView = null;
		this.toolbar = null;

		this.metaModelMapper = null;
		this.metaModelRunner = null;

		this.mmEntities = null;
		this.mmRelation = null;

		this.previousCodeData = {};
		this.codePositions = {};

		this.codesystemLoaded = false;
		this.metamodelLoaded = false;

		this.codesystemFinishedLoading = this.codesystemFinishedLoading.bind(this);
	}

	getToolbar() {
		return this.toolbar;
	}

	getUmlGraphView() {
		return this.umlGraphView;
	}

	getMetaModelMapper() {
		return this.metaModelMapper
	}

	getMetaModelEntities() {
		return this.mmEntities;
	}

	getMetaModelRelations() {
		return this.mmRelations;
	}

	getMetaModelEntityById(id) {
		return this.mmEntities.find((mmEntity) => mmEntity.id == id);
	}

	getMetaModelEntityByName(name) {
		return this.mmEntities.find((mmEntity) => mmEntity.name == name);
	}

	componentDidMount() {
		this.loadMetaModel();
	}

	loadMetaModel() {
		const _this = this;

		MetaModelEntityEndpoint.listEntities(1).then(function (resp) {
			_this.mmEntities = resp.items || [];

			MetaModelRelationEndpoint.listRelations(1).then(function (resp) {
				_this.mmRelations = resp.items || [];

				_this.metaModelFinishedLoading();
			});
		});
	}

	metaModelFinishedLoading() {
		this.metaModelLoaded = true;

		if (this.codesystemLoaded && !this.initialized) {
			this.initialized = true;
			this.initialize();
		}
	}

	codesystemFinishedLoading() {
		this.codesystemLoaded = true;

		if (this.metaModelLoaded && !this.initialized) {
			this.initialized = true;
			this.initialize();
		}
	}

	initialize() {
		const _this = this;

		this.consistencyManager = new ConsistencyManager();
		
		this.metaModelMapper = new MetaModelMapper(this);
		this.metaModelRunner = new MetaModelRunner(this, this.metaModelMapper);

		this.initializeSelection();

		UmlCodePositionEndpoint.listCodePositions(this.props.codesystemId).then(function (resp) {
			let umlCodePositions = resp.items || [];

			_this.initializePositions(umlCodePositions);

			_this.initializeNodes();
		});
	}

	initializeSelection() {
		const _this = this;

		this.umlGraphView.addSelectionChangedEventListener((sender, evt) => {
			const cells = sender.cells;

			if (!_this.umlGraphView.isConnectingEdge()) {
				if (cells != null && cells.length >= 1) {
					const cell = cells[0];

					if (_this.umlGraphView.isCellUmlClass(cell)) {
						const code = _this.getCodeByNode(cell);
						this.props.codesystemView.setSelected(code);
					}
				}
			}
		});
	}

	initializePositions(umlCodePositions) {
		let _this = this;

		// Add cells moved event listener
		_this.initCellsMovedEventListener();

		if (umlCodePositions.length > 0) {
			// Set CodePositions
			_this.refreshUmlCodePositions(umlCodePositions);
		}
	}

	initializeNodes() {
		let codes = this.getCodes();

		let relations = [];

		// Map codes first and relations after
		for (let i = 0; i < codes.length; i++) {
			const code = codes[i];

			// Code mapping
			this.metaModelRunner.evaluateAndRunCode(code);

			// Initialize previous code data
			const previousMetaModelElementIds = code.mmElementIDs != null ? code.mmElementIDs.slice() /*copy*/ : [];
			const previousRelations = code.relations != null ? code.relations.map(relation => Object.assign({}, relation)) /*copy*/ : [];
			this.setPreviousCodeData(code.id, previousMetaModelElementIds, previousRelations);
		}

		for (let i = 0; i < codes.length; i++) {
			const code = codes[i];

			// Relations mapping
			if (code.relations != null) {
				for (let j = 0; j < code.relations.length; j++) {
					const relation = code.relations[j];

					const destination = this.getCodeByCodeId(relation.codeId);

					this.metaModelRunner.evaluateAndRunCodeRelation(code, destination, relation);
				}
			}
		}
	}

	initCellsMovedEventListener() {
		let _this = this;

		this.umlGraphView.addCellsMovedEventListener(function (sender, event) {
			let cells = event.properties.cells;
			let dx = event.properties.dx;
			let dy = event.properties.dy;

			let umlCodePositions = [];

			cells.forEach((cell) => {
				if (_this.umlGraphView.isCellUmlClass(cell)) {
					let code = _this.getCodeByNode(cell);

					let codePosition = _this.getCodePosition(code.codeID);
					codePosition.x = cell.getGeometry().x;
					codePosition.y = cell.getGeometry().y;

					umlCodePositions.push(codePosition);
				}
			});

			UmlCodePositionEndpoint.insertOrUpdateCodePositions(umlCodePositions).then((resp) => {
				let updatedCodePositions = resp.items || [];

				_this.refreshUmlCodePositions(updatedCodePositions);
			});
		});
	}

	refreshUmlCodePositions(newUmlCodePositions) {
		const _this = this;

		newUmlCodePositions.forEach((newUmlCodePosition) => {
			_this.setCodePosition(newUmlCodePosition.codeId, newUmlCodePosition);
		});
	}

	codesystemSelectionChanged(code) {
		const node = this.getNodeByCodeId(code.id);

		// Prevent loops
		if (!this.umlGraphView.isCellSelected(node)) {
			// Reset edge if connecting
			if (this.umlGraphView.isConnectingEdge()) {
				this.umlGraphView.resetConnectingEdge();
			}

			// Clear selection
			this.umlGraphView.clearSelection();

			// Select node
			if (node != null) {
				this.umlGraphView.selectCell(node);
			}
		}
	}

	/**
	 * Callback for the umlGraphView zoom function. 
	 */
	onZoom(percentage) {
		this.umlEditor.toolbar.onZoom(percentage);
	}

	/**
	 * Opens a modal, where the user can select a can select a code for a new class field.
	 */
	openClassFieldModal(cell) {
		const _this = this;

		const code = this.getCodeByNode(cell);

		const relationMetaModelEntityName = this.metaModelMapper.getClassFieldRelationEntityName();
		const mappingAction = MappingAction.ADD_CLASS_FIELD;

		const addFieldModal = new UmlCodePropertyModal(this, 'Add new Field', code, _this.props.codesystemView, relationMetaModelEntityName, mappingAction);

		addFieldModal.showModal().then(function (data) {
			_this.createField(code, data.selectedCode);
		});
	}

	/**
	 * Opens a modal, where the user can select a can select a code for a new class method.
	 */
	openClassMethodModal(cell) {
		const _this = this;

		const code = this.getCodeByNode(cell);

		const relationMetaModelEntityName = this.metaModelMapper.getClassMethodRelationEntityName();
		const mappingAction = MappingAction.ADD_CLASS_METHOD;

		const addMethodModal = new UmlCodePropertyModal(this, 'Add new Method', code, _this.props.codesystemView, relationMetaModelEntityName, mappingAction);

		addMethodModal.showModal().then(function (data) {
			_this.createMethod(code, data.selectedCode);
		});
	}

	getCodePosition(codeId) {
		const key = codeId;

		if (this.codePositions.hasOwnProperty(key)) {
			return this.codePositions[key];
		}

		return null;
	}

	setCodePosition(codeId, umlCodePosition) {
		const key = codeId;

		this.codePositions[key] = umlCodePosition;
	}

	removeCodePosition(codeId) {
		const key = codeId;

		if (this.codePositions.hasOwnProperty(key)) {
			delete this.codePositions[key];
		}
	}

	getPreviousCodeData(codeId) {
		const key = codeId;

		if (!this.previousCodeData.hasOwnProperty(key)) {
			this.previousCodeData[key] = {
				mmElementIDs: [],
				relations: []
			};
		}

		return this.previousCodeData[key];
	}

	setPreviousCodeData(codeId, mmElementIDs, relations) {
		const key = codeId;

		if (this.previousCodeData.hasOwnProperty(key)) {
			// Set mmElementIDs
			if (mmElementIDs) {
				this.previousCodeData[key].mmElementIDs = mmElementIDs;
			}

			// Set relations
			if (relations) {
				this.previousCodeData[key].relations = relations;
			}
		} else {
			this.previousCodeData[key] = {
				mmElementIDs: mmElementIDs != null ? mmElementIDs : [],
				relations: relations != null ? relations : []
			};
		}
	}

	removePreviousCodeData(codeId) {
		const key = codeId;

		if (this.previousCodeData.hasOwnProperty(key)) {
			delete this.previousCodeData[key];
		}
	}

	/**
	 * Returns an array containing all codes.
	 */
	getCodes() {
		// Convert codes into a simple array
		let codes = [];

		let convertCodeIntoSimpleArray = (code) => {
			codes.push(code);

			if (code.children) {
				code.children.forEach(convertCodeIntoSimpleArray);
			}
		}

		this.props.codesystemView.getCodesystem().forEach(convertCodeIntoSimpleArray);

		return codes;
	}

	/**
	 * Returns the code with the given id. 
	 */
	getCodeById(id) {
		return this.props.getCodeById(id);
	}

	/**
	 * Returns the code with the given codeId. 
	 */
	getCodeByCodeId(codeId) {
		return this.props.getCodeByCodeId(codeId);
	}

	/**
	 * Returns the code connected to the given node.
	 */
	getCodeByNode(node) {
		const cellValue = node.value;
		return this.getCodeById(cellValue.getCodeId());
	}

	/**
	 * Returns the node connected to the given code (id).
	 */
	getNodeByCodeId(id) {
		return this.umlGraphView.getNodeByCodeId(id);
	}

	/**
	 * Does the code have a corresponding node? Checks if the code is mapped in the uml editor (as a class object).
	 */
	isCodeMapped(code) {
		return this.getNodeByCodeId(code.id) != null;
	}

	/**
	 * Creates a new edge with type aggregation.
	 */
	createEdgeAggregation(sourceCode, destinationCode) {
		this.createEdge(sourceCode, destinationCode, EdgeType.AGGREGATION, edgeNode);
	}

	/**
	 * Creates a new edge with type generalization.
	 */
	createEdgeGeneralization(sourceCode, destinationCode) {
		this.createEdge(sourceCode, destinationCode, EdgeType.GENERALIZATION, edgeNode);
	}

	/**
	 * Creates a new edge with type association.
	 */
	createEdgeDirectedAssociation(sourceCode, destinationCode) {
		this.createEdge(sourceCode, destinationCode, EdgeType.DIRECTED_ASSOCIATION, edgeNode);
	}

	/**
	 * Adds a new edge to the database. 
	 */
	createEdge(sourceCode, destinationCode, edgeType) {
		const relationMetaModelEntityName = this.metaModelMapper.getEdgeRelationEntityName(edgeType);

		this.createRelation(sourceCode, destinationCode, relationMetaModelEntityName);
	}

	/**
	 * Adds a new field to the database. 
	 */
	createField(sourceCode, destinationCode) {
		const relationMetaModelEntityName = this.metaModelMapper.getClassFieldRelationEntityName();

		this.createRelation(sourceCode, destinationCode, relationMetaModelEntityName);
	}

	/**
	 * Adds a new method to the database. 
	 */
	createMethod(sourceCode, destinationCode) {
		const relationMetaModelEntityName = this.metaModelMapper.getClassMethodRelationEntityName();

		this.createRelation(sourceCode, destinationCode, relationMetaModelEntityName);
	}

	/**
	 * Create a new relation in the database. 
	 */
	createRelation(sourceCode, destinationCode, relationMetaModelEntityName) {
		const _this = this;

		const relationMetaModelEntity = this.getMetaModelEntityByName(relationMetaModelEntityName);

		// Update database
		CodesEndpoint.addRelationship(sourceCode.id, destinationCode.codeID, relationMetaModelEntity.id).then((resp) => {
			sourceCode.relations = resp.relations;

			_this.props.updateCode(sourceCode);
		});
	}

	/**
	 * Delete a class field relation from the database. This method does not directly update the uml-editor.
	 */
	deleteClassField(cell, relationId) {
		const code = this.getCodeByNode(cell);
		this.deleteRelation(code, relationId);
	}

	/**
	 * Delete a class method relation from the database. This method does not directly update the uml-editor.
	 */
	deleteClassMethod(cell, relationId) {
		const code = this.getCodeByNode(cell);
		this.deleteRelation(code, relationId);
	}

	/**
	 * Deletes a relation from the database. This method does not directly update the uml-editor.
	 */
	deleteRelation(code, relationId) {
		this.props.deleteRelationship(code.id, relationId);
	}

	/**
	 * Adds a node to the graph. Does not update the database.
	 */
	addNode(code) {
		const _this = this;

		const node = this.umlGraphView.addNode(code.id, code.name);

		let x = 0;
		let y = 0;

		// Register code position
		let codePosition = this.getCodePosition(code.codeID);

		if (codePosition == null) {
			[x, y] = this.umlGraphView.getFreeNodePosition(node);

			codePosition = {
				codeId: code.codeID,
				codesystemId: code.codesystemID,
				x: x,
				y: y
			};
			this.setCodePosition(code.codeID, codePosition);

			let newCodePositions = [];
			newCodePositions.push(codePosition);

			// insert into database
			UmlCodePositionEndpoint.insertOrUpdateCodePositions(newCodePositions).then((resp) => {
				let updatedCodePositions = resp.items || [];
				_this.refreshUmlCodePositions(updatedCodePositions);
			});

		} else {
			x = codePosition.x;
			y = codePosition.y;
		}

		this.umlGraphView.moveNode(node, x, y);
		this.umlGraphView.recalculateNodeSize(node);
	}

	/**
	 * Renames a node in the graph. Does not update the database.
	 */
	renameNode(code) {
		const node = this.getNodeByCodeId(code.id);
		this.umlGraphView.renameNode(node, code.name);
	}

	/**
	 * Removes a node from the graph. Does not update the database.
	 */
	removeNode(code) {
		const node = this.getNodeByCodeId(code.id);
		this.umlGraphView.removeNode(node);
	}

	/**
	 * Adds a class field to a node in the graph. Does not update the database.
	 */
	addClassField(sourceCode, destinationCode, relation) {
		const sourceNode = this.getNodeByCodeId(sourceCode.id);

		const fieldText = this.metaModelMapper.getClassFieldText(destinationCode.name, 'TODO-returnType');
		this.umlGraphView.addClassField(sourceNode, relation.key.id, '+', fieldText);
	}

	/**
	 * Removes a class field from a node in the graph. Does not update the database.
	 */
	removeClassField(code, relation) {
		const node = this.getNodeByCodeId(code.id);

		this.umlGraphView.removeClassField(node, relation.key.id);
	}

	/**
	 * Adds a class method to a node to the graph. Does not update the database.
	 */
	addClassMethod(sourceCode, destinationCode, relation) {
		const sourceNode = this.getNodeByCodeId(sourceCode.id);

		const methodText = this.metaModelMapper.getClassMethodText(destinationCode.name, 'TODO-returnType', ['TODO', 'ARGUMENTS']);
		this.umlGraphView.addClassMethod(sourceNode, relation.key.id, '+', methodText);
	}

	/**
	 * Removes a class method from a node in the graph. Does not update the database.
	 */
	removeClassMethod(code, relation) {
		const node = this.getNodeByCodeId(code.id);

		this.umlGraphView.removeClassMethod(node, relation.key.id);
	}

	/**
	 * Adds an edge between two nodes in the graph. Does not update the database.
	 */
	addEdge(sourceCode, destinationCode, relation, edgeType) {
		const sourceNode = this.getNodeByCodeId(sourceCode.id);
		const destinationNode = this.getNodeByCodeId(destinationCode.id);

		const edge = this.umlGraphView.addEdge(sourceNode, destinationNode, relation.key.id, edgeType);
	}

	/**
	 * Removes an edge from a node in the graph. Does not update the database.
	 */
	removeEdge(code, relation) {
		const node = this.getNodeByCodeId(code.id);

		this.umlGraphView.removeEdge(node, relation.key.id);
	}

    codeRemoved(code) {
        this.consistencyManager.codeRemoved(code);
    }

    codeUpdated(code) {
        this.consistencyManager.codeUpdated(code);
    }

	render() {
		const _this = this;

		return (
			<StyledUmlEditor>
                <Toolbar ref={(toolbar) => {if (toolbar != null) _this.toolbar = toolbar}} className="row no-gutters" umlEditor={_this} createCode={_this.props.createCode} />
                <UmlGraphView ref={(umlGraphView) => {if (umlGraphView != null) _this.umlGraphView = umlGraphView}} umlEditor={_this} onZoom={_this.onZoom} toggleCodingView={this.props.toggleCodingView}/>
            </StyledUmlEditor>
		);
	}
}