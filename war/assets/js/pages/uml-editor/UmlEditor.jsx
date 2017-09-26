import React from 'react';
import styled from 'styled-components';

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

		for (let i = 0; i < codes.length; i++) {
			const code = codes[i];

			// Code mapping
			this.metaModelRunner.evaluateAndRunCode(code);

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

			console.log('Updating ' + umlCodePositions.length + ' UmlCodePosition entries in the database...');

			UmlCodePositionEndpoint.insertOrUpdateCodePositions(umlCodePositions).then((resp) => {
				let updatedCodePositions = resp.items || [];
				console.log('Updated ' + updatedCodePositions.length + ' UmlCodePosition entries in the database.');

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































	// THIS WAS IN UPDATECODE AT THE END
	//    Select code if necessary
	//    if (this.props.codesystemView.getSelected().codeID == code.codeID) {
	//        if (umlClass.getNode() != null) {
	//            this.umlGraphView.selectCell(umlClass.getNode());
	//        }
	//    }



	// TODO: if we call createNewRelation after a new edge was connected, the edge will be added a 2nd time. how do we prevent this?





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
			throw new Error('Previous code data for id ' + codeId + ' does not exist.');
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

	/**
	 * This function is called, when a code was removed from the "outside". If somewhere else in the coding-editor
	 * a code was removed, this function will update the uml-editor.
	 */
	codeRemoved(code) {
		if (this.isCodeMapped(code)) {
			this.removeCode(code);
		}

		this.removePreviousCodeData(code.id);
	}

	/**
	 * Updates the uml-editor after updating a code (or inserting a new code) somewhere else in the coding-editor.
	 * This function compares the code to its latest state (previousCodeData) and determines the changes.
	 */
	codeUpdated(code) {
		const _this = this;

		// Previous code data
		const previousCodeData = this.getPreviousCodeData(code.id);


		// Update name
		if (this.isCodeMapped(code)) {
			this.renameNode(code);
		}


		// Did the MetaModel change?
		const previousMetaModelElementIds = previousCodeData.mmElementIDs;
		const currentMetaModelElementIds = code.mmElementIDs != null ? code.mmElementIDs : [];

		// Sort both arrays to properly find changes or ensure equality
		previousMetaModelElementIds.sort();
		currentMetaModelElementIds.sort();

		// Are both arrays equal?
		let mmElementIdsEqual = (previousMetaModelElementIds.length == currentMetaModelElementIds.length) && previousMetaModelElementIds.every((element, index) => {
			return element == currentMetaModelElementIds[index];
		});

		// Update if the metaModelIDs changed
		if (!mmElementIdsEqual) {
			this.codeMetaModelEntitiesChanged(code, previousMetaModelElementIds);
		}


		// Did the relations change?
		const previousRelations = previousCodeData.relations;
		const currentRelations = code.relations != null ? code.relations : [];

		let removedRelations = [];
		let addedRelations = [];

		previousRelations.forEach((previousRelation) => {
			let exists = false;
			currentRelations.forEach((currentRelation) => {
				if (previousRelation.key.id == currentRelation.key.id) {
					exists = true;
				}
			});

			if (!exists) {
				removedRelations.push(previousRelation);
			}
		});

		currentRelations.forEach((currentRelation) => {
			let exists = false;
			previousRelations.forEach((previousRelation) => {
				if (previousRelation.key.id == currentRelation.key.id) {
					exists = true;
				}
			});

			if (!exists) {
				addedRelations.push(currentRelation);
			}
		});

		removedRelations.forEach((relation) => {
			let sourceCode = code;
			let destinationCode = this.getCodeByCodeId(relation.codeId);

			_this.metaModelRunner.evaluateAndUndoCodeRelation(sourceCode, destinationCode, relation);
		});

		addedRelations.forEach((relation) => {
			let sourceCode = code;
			let destinationCode = this.getCodeByCodeId(relation.codeId);

			_this.metaModelRunner.evaluateAndRunCodeRelation(sourceCode, destinationCode, relation);
		});


		// Set previous code data
		const newPreviousMetaModelElementIds = currentMetaModelElementIds.slice() /*copy*/ ;
		const newPreviousRelations = currentRelations.map(relation => Object.assign({}, relation)) /*copy*/ ;
		this.setPreviousCodeData(code.id, newPreviousMetaModelElementIds, newPreviousRelations);
	}

	/**
	 * Is called if the MetaModel of a code changed during update.
	 */
	codeMetaModelEntitiesChanged(code, previousMetaModelElementIds) {
		// Prepare previousCode
		const previousCode = Object.assign({}, code);
		previousCode.mmElementIDs = previousMetaModelElementIds;

		// Evaluate mapping action
		const previousNodeAction = this.metaModelMapper.evaluateCode(previousCode);
		const currentNodeAction = this.metaModelMapper.evaluateCode(code);

		// Mapping action changed?
		if (previousNodeAction != currentNodeAction) {
			this.metaModelRunner.undoCode(previousNodeAction, code);
			this.metaModelRunner.runCode(currentNodeAction, code);
		}

		// Re-evaluate outgoing relations
		if (code.relations != null) {
			for (let i = 0; i < code.relations.length; i++) {
				let relation = code.relations[i];

				let sourceCode = code;
				let destinationCode = this.getCodeByCodeId(relation.codeId);

				let previousSourceCode = previousCode;
				let previousDestinationCode = destinationCode;

				// Source == Destination
				if (destinationCode.codeID == sourceCode.codeID) {
					previousDestinationCode = previousSourceCode;
				}

				this.checkSingleRelation(relation, sourceCode, destinationCode, previousSourceCode, previousDestinationCode);
			}
		}

		// Incoming relations
		this.getCodes().forEach((c) => {
			// Ignore this code
			if (c.codeID != code.codeID) {
				if (c.relations != null) {
					// Check relations
					c.relations.forEach((relation) => {
						if (relation.codeId == code.codeID) {
							let sourceCode = c;
							let destinationCode = code;

							let previousSourceCode = sourceCode;
							let previousDestinationCode = previousCode;

							// Source == Destination
							if (sourceCode.codeID == destinationCode.codeID) {
								previousSourceCode = previousDestinationCode;
							}

							this.checkSingleRelation(relation, sourceCode, destinationCode, previousSourceCode, previousDestinationCode);
						}
					});
				}
			}
		});
	}

	/**
	 * Checks if a new mapping can be applied for the relation.
	 */
	checkSingleRelation(relation, sourceCode, destinationCode, previousSourceCode, previousDestinationCode) {
		const relationMetaModelId = relation.mmElementId;
		const relationMetaModelEntity = this.getMetaModelEntityById(relationMetaModelId);

		// Evaluate actions
		let oldAction = this.metaModelMapper.evaluateCodeRelation(previousSourceCode, previousDestinationCode, relation);
		let newAction = this.metaModelMapper.evaluateCodeRelation(sourceCode, destinationCode, relation);

		// Execute action
		if (oldAction != newAction) {
			this.metaModelRunner.undoCodeRelation(oldAction, sourceCode, destinationCode, relation);

			this.metaModelRunner.undoCodeRelation(newAction, sourceCode, destinationCode, relation);
		}
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