import React from 'react';
import styled from 'styled-components';

import UmlClass from './model/UmlClass.js';
import UmlClassManager from './model/UmlClassManager.js';
import UmlClassRelation from './model/UmlClassRelation.js';
import UmlClassRelationManager from './model/UmlClassRelationManager.js';

import {
	MappingAction
} from './mapping/MappingAction.js';
import MetaModelMapper from './mapping/MetaModelMapper.js';
import MetaModelRunner from './mapping/MetaModelRunner.js';

import Toolbar from './toolbar/Toolbar.jsx';
import UmlGraphView from './UmlGraphView.jsx';

import UmlCodeMetaModelModal from '../../common/modals/UmlCodeMetaModelModal';
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

		this.codesystemId = this.props.codesystemId;
		this.codesystemView = this.props.codesystemView;

		this.umlGraphView = null;
		this.toolbar = null;

		this.metaModelMapper = null;
		this.metaModelRunner = null;

		this.umlClassManager = null;
		this.umlClassRelationManager = null;

		this.mmEntities = null;
		this.mmRelation = null;

		this.codesystemLoaded = false;
		this.metamodelLoaded = false;
	}

	getToolbar() {
		return this.toolbar;
	}

	getUmlGraphView() {
		return this.umlGraphView;
	}

	getUmlClassManager() {
		return this.umlClassManager;
	}

	getUmlClassRelationManager() {
		return this.umlClassRelationManager;
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

		if (this.codesystemLoaded) {
			this.initialize();
		}
	}

	codesystemFinishedLoading() {
		this.codesystemLoaded = true;

		if (this.metaModelLoaded) {
			this.initialize();
		}
	}

	initialize() {
		this.metaModelMapper = new MetaModelMapper(this);
		this.metaModelRunner = new MetaModelRunner(this, this.metaModelMapper);

		this.umlClassManager = new UmlClassManager();
		this.umlClassRelationManager = new UmlClassRelationManager();

		this.initializeEventListeners();

		this.initializeUmlClasses();

		this.initializeGraph();

		this.initializePositions();
	}

	initializeEventListeners() {
		const _this = this;

		this.umlGraphView.addSelectionChangedEventListener((sender, evt) => {
			const cells = sender.cells;

			if (!_this.umlGraphView.isConnectingEdge()) {
				if (cells != null && cells.length >= 1) {
					const cell = cells[0];

					if (_this.umlGraphView.isCellUmlClass(cell)) {
						const umlClass = _this.umlClassManager.getByNode(cell);

						this.codesystemView.setSelected(umlClass.getCode());
					}
				}
			}
		});
	}

	initializeUmlClasses() {
		// Convert codes into a simple array
		let codes = [];

		let convertCodeIntoSimpleArray = (code) => {
			codes.push(code);

			if (code.children) {
				code.children.forEach(convertCodeIntoSimpleArray);
			}
		}

		this.codesystemView.getCodesystem().forEach(convertCodeIntoSimpleArray);


		let relations = [];

		for (let i = 0; i < codes.length; i++) {
			const code = codes[i];

			// Register new entry
			const umlClass = new UmlClass(code);
			this.umlClassManager.add(umlClass);

			// Register code relations
			if (code.relations != null) {
				for (let j = 0; j < code.relations.length; j++) {
					const relation = code.relations[j];

					relations.push({
						'sourceId': code.codeID,
						'destinationId': relation.codeId,
						'metaModelEntityId': relation.mmElementId
					});
				}
			}
		}

		// Process code relations
		for (let i = 0; i < relations.length; i++) {
			const relation = relations[i];

			let sourceUmlClass = this.umlClassManager.getByCodeId(relation.sourceId);
			let destinationUmlClass = this.umlClassManager.getByCodeId(relation.destinationId);

			let relationMetaModelEntity = this.getMetaModelEntityById(relation.metaModelEntityId);

			// Register new entry
			const umlClassRelation = new UmlClassRelation(sourceUmlClass, destinationUmlClass, relationMetaModelEntity);
			this.umlClassRelationManager.add(umlClassRelation);
		}
	}

	initializeGraph() {
		this.umlClassManager.getAll().forEach((umlClass) => {
			this.metaModelRunner.evaluateAndRunAction({
				umlClass: umlClass
			});
		});

		this.umlClassRelationManager.getAll().forEach((umlClassRelation) => {
			this.metaModelRunner.evaluateAndRunAction({
				umlClassRelation: umlClassRelation
			});
		});
	}

	initializePositions() {
		let _this = this;

		console.log('Loading UmlCodePosition entries from the database...');

		UmlCodePositionEndpoint.listCodePositions(this.codesystemId).then(function (resp) {
			let umlCodePositions = resp.items || [];

			console.log('Loaded ' + umlCodePositions.length + ' UmlCodePosition entries from the database. Found ' + _this.umlClassManager.size() + ' codes.');

			if (umlCodePositions.length > 0) {
				// Add cells moved event listener
				_this.initCellsMovedEventListener();

				// Set CodePositions
				_this.refreshUmlCodePositions(umlCodePositions);

				// Unregistered codes exist
				if (umlCodePositions.length != _this.umlClassManager.size()) {
					// Find new codes
					let unregisteredUmlCodePositions = [];

					_this.umlClassManager.getAll().forEach((umlClass) => {
						let exists = umlCodePositions.find((umlCodePosition) => umlCodePosition.codeId == umlClass.getCode().codeID) != null;

						let code = umlClass.getCode();
						let node = umlClass.getNode();

						if (!exists) {
							// If the code is not mapped => assume position (0,0)
							let x = 0;
							let y = 0;

							if (node != null) {
								x = node.getGeometry().x;
								y = node.getGeometry().y;
							}

							let umlCodePosition = {
								'codeId': code.codeID,
								'codesystemId': _this.codesystemId,
								'x': x,
								'y': y
							};

							unregisteredUmlCodePositions.push(umlCodePosition);
							umlCodePositions.push(umlCodePosition);
						}
					});

					_this.insertUnregisteredUmlCodePositions(unregisteredUmlCodePositions);
				}

				umlCodePositions.forEach((umlCodePosition) => {
					let umlClass = _this.umlClassManager.getByCodeId(umlCodePosition.codeId);

					if (umlClass.getNode() != null) {
						_this.umlGraphView.moveNode(umlClass.getNode(), umlCodePosition.x, umlCodePosition.y);
					}
				});
			} else {
				console.log('Applying layout');

				// Apply layout
				_this.umlGraphView.applyLayout();

				// Add cells moved event listener 
				// This happens after apply layout - otherwise apply layout triggers the event
				_this.initCellsMovedEventListener();

				umlCodePositions = [];

				_this.umlClassManager.getAll().forEach((umlClass) => {
					let code = umlClass.getCode();
					let node = umlClass.getNode();

					// If the code is not mapped => assume position (0,0)
					let x = 0;
					let y = 0;

					if (node != null) {
						x = node.getGeometry().x;
						y = node.getGeometry().y;
					}

					umlCodePositions.push({
						'codeId': code.codeID,
						'codesystemId': _this.codesystemId,
						'x': x,
						'y': y
					});
				});

				console.log('Inserting ' + umlCodePositions.length + ' new UmlCodePosition entries into the database...');

				UmlCodePositionEndpoint.insertCodePositions(umlCodePositions).then((resp) => {
					let insertedCodePositions = resp.items || [];

					console.log('Inserted ' + insertedCodePositions.length + ' new UmlCodePosition entries into the database.');

					_this.refreshUmlCodePositions(insertedCodePositions);
				});
			}
		});
	}

	initCellsMovedEventListener() {
		let _this = this;

		this.umlGraphView.addCellsMovedEventListener(function (sender, event) {
			let cells = event.properties.cells;
			let dx = event.properties.dx;
			let dy = event.properties.dy;

			let umlCodePositions = [];

			cells.forEach((cell) => {
				if (cell.vertex == true) {
					let umlClass = _this.umlClassManager.getByNode(cell);
					let code = umlClass.getCode();
					let node = umlClass.getNode();

					let umlCodePosition = umlClass.getUmlCodePosition();
					umlCodePosition.x = node.getGeometry().x;
					umlCodePosition.y = node.getGeometry().y;

					umlCodePositions.push(umlCodePosition);
				}
			});

			console.log('Updating ' + umlCodePositions.length + ' UmlCodePosition entries in the database...');

			UmlCodePositionEndpoint.updateCodePositions(umlCodePositions).then((resp) => {
				let updatedCodePositions = resp.items || [];
				console.log('Updated ' + updatedCodePositions.length + ' UmlCodePosition entries in the database.');

				_this.refreshUmlCodePositions(updatedCodePositions);
			});
		});
	}

	insertUnregisteredUmlCodePositions(unregisteredUmlCodePositions) {
		const _this = this;

		console.log('Inserting ' + unregisteredUmlCodePositions.length + ' unregistered UmlCodePosition entries into the database...');

		UmlCodePositionEndpoint.insertCodePositions(unregisteredUmlCodePositions).then((resp) => {
			let insertedCodePositions = resp.items || [];

			console.log('Inserted ' + insertedCodePositions.length + ' unregistered UmlCodePosition entries into the database.');

			_this.refreshUmlCodePositions(insertedCodePositions);
		});
	}

	refreshUmlCodePositions(newUmlCodePositions) {
		console.log('Refreshing UmlCodePositions.');

		const _this = this;
		newUmlCodePositions.forEach((newUmlCodePosition) => {
			let umlClass = _this.umlClassManager.getByCodeId(newUmlCodePosition.codeId);
			umlClass.setUmlCodePosition(newUmlCodePosition);
		});
	}

	codeUpdated(code) {
		const _this = this;

		console.log('Begin updating a code...');

		let umlClass = this.umlClassManager.getByCode(code);

		// Is the code new?
		if (umlClass == null) {
			umlClass = new UmlClass(code);
			umlClass.setPreviousCode([], []);
			this.umlClassManager.add(umlClass);

			this.insertUnregisteredUmlCodePositions([{
				'codeId': code.codeID,
				'codesystemId': this.codesystemId,
				'x': 0,
				'y': 0
			}]);
		}

		// Update name
		if (umlClass.getNode() != null) {
			this.umlGraphView.renameNode(umlClass.getNode(), code.name);
		}

		// Did the MetaModel change?
		let previousMetaModelElementIds = umlClass.getPreviousCode().mmElementIDs;
		let currentMetaModelElementIds = code.mmElementIDs != null ? code.mmElementIDs : [];

		let mmElementIdsEqual = (previousMetaModelElementIds.length == currentMetaModelElementIds.length) && previousMetaModelElementIds.every((element, index) => {
			return currentMetaModelElementIds.indexOf(element) >= 0;
		});

		if (!mmElementIdsEqual) {
			console.log('The MetaModel changed...');

			this.exchangeCodeMetaModelEntities(umlClass, previousMetaModelElementIds);
		}

		umlClass.getPreviousCode().mmElementIDs = currentMetaModelElementIds.slice(); // copy

		// Did the relations change?
		let previousRelations = umlClass.getPreviousCode().relations;
		let currentRelations = code.relations != null ? code.relations : [];

		let removedRelations = [];
		let addedRelations = [];

		previousRelations.forEach((previousRelation) => {
			let exists = false;
			currentRelations.forEach((currentRelation) => {
				if (previousRelation.codeId == currentRelation.codeId
					&& previousRelation.mmElementId == currentRelation.mmElementId) {
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
				if (previousRelation.codeId == currentRelation.codeId
					&& previousRelation.mmElementId == currentRelation.mmElementId) {
					exists = true;
				}
			});

			if (!exists) {
				addedRelations.push(currentRelation);
			}
		});

		removedRelations.forEach((removedRelation) => {
			let sourceUmlClass = umlClass;
			let destinationUmlClass = _this.umlClassManager.getByCodeId(removedRelation.codeId);

			let relationMetaModelEntity = this.getMetaModelEntityById(removedRelation.mmElementId);

			let umlClassRelation = _this.umlClassRelationManager.get(sourceUmlClass, destinationUmlClass, relationMetaModelEntity);

			_this.metaModelRunner.evaluateAndUndoAction({
				umlClassRelation: umlClassRelation
			});

			_this.umlClassRelationManager.remove(umlClassRelation);
		});

		addedRelations.forEach((addedRelation) => {
			let sourceUmlClass = umlClass;
			let destinationUmlClass = _this.umlClassManager.getByCodeId(addedRelation.codeId);

			let relationMetaModelEntity = this.getMetaModelEntityById(addedRelation.mmElementId);

			// Relation exists
			if (_this.umlClassRelationManager.get(sourceUmlClass, destinationUmlClass, relationMetaModelEntity) != null) {
				return;
			}

			const umlClassRelation = new UmlClassRelation(sourceUmlClass, destinationUmlClass, relationMetaModelEntity);
			_this.umlClassRelationManager.add(umlClassRelation);

			_this.metaModelRunner.evaluateAndRunAction({
				umlClassRelation: umlClassRelation
			});
		});

		umlClass.getPreviousCode().relations = currentRelations.map(relation => Object.assign({}, relation)); // copy

		console.log('Finished updating a code.');

		// Select code if necessary
		if (this.codesystemView.getSelected().codeID == code.codeID) {
			if (umlClass.getNode() != null) {
				this.umlGraphView.selectCell(umlClass.getNode());
			}
		}
	}

	codeRemoved(code) {
		let umlClass = this.umlClassManager.getByCode(code);

		this.removeNode(umlClass);

		this.umlClassManager.remove(umlClass);
	}

	codesystemSelectionChanged(code) {
		const umlClass = this.umlClassManager.getByCode(code);

		// Prevent loops
		if (!this.umlGraphView.isCellSelected(umlClass.getNode())) {
			// Reset edge if connecting
			if (this.umlGraphView.isConnectingEdge()) {
				this.umlGraphView.resetConnectingEdge();
			}

			// Clear selection
			this.umlGraphView.clearSelection(this.umlClassManager.getAll());

			// Select node
			if (umlClass.getNode() != null) {
				this.umlGraphView.selectCell(umlClass.getNode());
			}
		}
	}

	addNode(umlClass) {
		const node = this.umlGraphView.addNode(umlClass.getCode().name);
		umlClass.setNode(node);

		const umlCodePosition = umlClass.getUmlCodePosition();
		if (umlCodePosition != null) {
			this.umlGraphView.moveNode(node, umlCodePosition.x, umlCodePosition.y);
		}

		console.log('Added new node to the graph: ' + umlClass.getCode().name + ' (' + umlClass.getCode().codeID + ')');
	}

	addEdge(umlClassRelation, edgeType) {
		const sourceUmlClass = umlClassRelation.getSourceUmlClass();
		const destinationUmlClass = umlClassRelation.getDestinationUmlClass();

		const relationNode = this.umlGraphView.addEdge(sourceUmlClass.getNode(), destinationUmlClass.getNode(), edgeType);

		this.addRelation(umlClassRelation, relationNode, 'edge ' + edgeType);
	}

	addClassField(umlClassRelation) {
		const sourceUmlClass = umlClassRelation.getSourceUmlClass();
		const destinationUmlClass = umlClassRelation.getDestinationUmlClass();

		const relationNode = this.umlGraphView.addClassField(sourceUmlClass.getNode(), destinationUmlClass.getCode().name, 'TODO-returnType');

		this.addRelation(umlClassRelation, relationNode, 'class field');
	}

	addClassMethod(umlClassRelation) {
		const sourceUmlClass = umlClassRelation.getSourceUmlClass();
		const destinationUmlClass = umlClassRelation.getDestinationUmlClass();

		const relationNode = this.umlGraphView.addClassMethod(sourceUmlClass.getNode(), destinationUmlClass.getCode().name, 'TODO-returnType', ['TODO', 'ARGUMENTS']);

		this.addRelation(umlClassRelation, relationNode, 'class method');
	}

	addRelation(umlClassRelation, relationNode, relationType) {
		const sourceUmlClass = umlClassRelation.getSourceUmlClass();
		const destinationUmlClass = umlClassRelation.getDestinationUmlClass();

		umlClassRelation.setRelationNode(relationNode);

		console.log('Connection (' + relationType + ') between ' + sourceUmlClass.getCode().name + ' (' + sourceUmlClass.getCode().codeID + ') and ' + destinationUmlClass.getCode().name + ' (' + destinationUmlClass.getCode().codeID + ').');
	}

	removeNode(umlClass) {
		this.umlGraphView.removeNode(umlClass.getNode());

		umlClass.setNode(null);
	}

	removeEdge(umlClassRelation) {
		this.umlGraphView.removeEdge(umlClassRelation.getRelationNode());

		umlClassRelation.setRelationNode(null);
	}

	removeClassField(umlClassRelation) {
		const node = umlClassRelation.getSourceUmlClass().getNode() != null ? umlClassRelation.getSourceUmlClass().getNode() : umlClassRelation.getDestinationUmlClass().getNode();

		// Node was not removed
		if (node != null) {
			this.umlGraphView.removeClassField(node, umlClassRelation.getRelationNode());
		}

		umlClassRelation.setRelationNode(null);
	}

	removeClassMethod(umlClassRelation) {
		const node = umlClassRelation.getSourceUmlClass().getNode() != null ? umlClassRelation.getSourceUmlClass().getNode() : umlClassRelation.getDestinationUmlClass().getNode();

		// Node was not removed
		if (node != null) {
			this.umlGraphView.removeClassMethod(node, umlClassRelation.getRelationNode());
		}

		umlClassRelation.setRelationNode(null);
	}

	createNewEdgeAggregation(sourceNode, destinationNode, edgeNode) {
		this.createNewEdge(sourceNode, destinationNode, EdgeType.AGGREGATION, edgeNode);
	}

	createNewEdgeGeneralization(sourceNode, destinationNode, edgeNode) {
		this.createNewEdge(sourceNode, destinationNode, EdgeType.GENERALIZATION, edgeNode);
	}

	createNewEdgeDirectedAssociation(sourceNode, destinationNode, edgeNode) {
		this.createNewEdge(sourceNode, destinationNode, EdgeType.DIRECTED_ASSOCIATION, edgeNode);
	}

	createNewEdge(sourceNode, destinationNode, edgeType, edgeNode) {
		const sourceUmlClass = this.umlClassManager.getByNode(sourceNode);
		const destinationUmlClass = this.umlClassManager.getByNode(destinationNode);

		if (edgeNode == null) {
			edgeNode = this.umlGraphView.addEdge(sourceNode, destinationNode, edgeType);
		}

		const relationMetaModelEntityName = this.metaModelMapper.getEdgeRelationEntityName(edgeType);

		this.createNewRelation(sourceUmlClass, destinationUmlClass, relationMetaModelEntityName, edgeNode);
	}

	createNewField(sourceUmlClass, destinationUmlClass, fieldNode) {
		if (fieldNode == null) {
			fieldNode = this.umlGraphView.addClassField(sourceUmlClass.getNode(), destinationUmlClass.getCode().name, 'TODO-returnType');
		}

		const relationMetaModelEntityName = this.metaModelMapper.getClassFieldRelationEntityName();

		this.createNewRelation(sourceUmlClass, destinationUmlClass, relationMetaModelEntityName, fieldNode);
	}

	createNewMethod(sourceUmlClass, destinationUmlClass, methodNode) {
		if (methodNode == null) {
			methodNode = this.umlGraphView.addClassMethod(sourceUmlClass.getNode(), destinationUmlClass.getCode().name, 'TODO-returnType', ['TODO', 'ARGUMENTS']);
		}

		const relationMetaModelEntityName = this.metaModelMapper.getClassMethodRelationEntityName();

		this.createNewRelation(sourceUmlClass, destinationUmlClass, relationMetaModelEntityName, methodNode);
	}

	createNewRelation(sourceUmlClass, destinationUmlClass, relationMetaModelEntityName, relationNode) {
		const _this = this;

		const relationMetaModelEntity = this.getMetaModelEntityByName(relationMetaModelEntityName);

		const sourceCode = sourceUmlClass.getCode();

		// Create UmlClassRelation
		const umlClassRelation = new UmlClassRelation(sourceUmlClass, destinationUmlClass, relationMetaModelEntity, relationNode);
		this.umlClassRelationManager.add(umlClassRelation);

		// Update database
		CodesEndpoint.addRelationship(sourceCode.id, destinationUmlClass.getCode().codeID, relationMetaModelEntity.id).then((resp) => {
			sourceCode.relations = resp.relations;

			_this.props.updateCode(sourceCode);
			_this.props.refreshCodeView(sourceCode);
		});
	}

	overlayClickedMetaModel(cell) {
		const _this = this;

		let umlClass = _this.umlClassManager.getByNode(cell);
		let code = umlClass.getCode();

		let codeMetaModelModal = new UmlCodeMetaModelModal(code);

		codeMetaModelModal.showModal(_this.mmEntities, _this.mmRelations).then(function (data) {
			// TODO duplicate code in UnmappedCodeElement.jsx
			console.log('Closed modal');

			if (code.mmElementIDs != data.ids) {
				console.log('New mmElementIds for code ' + code.name + ' (' + code.codeID + '): ' + data.ids + '. Old Ids: ' + data.oldIds);

				code.mmElementIDs = data.ids;

				_this.props.updateCode(code, true);
				_this.props.refreshCodeView(code);
			}
		});
	}

	overlayClickedClassField(cell) {
		const _this = this;

		const sourceUmlClass = _this.umlClassManager.getByNode(cell);

		const relationMetaModelEntityName = this.getMetaModelMapper().getClassFieldRelationEntityName();
		const mappingAction = MappingAction.ADD_CLASS_FIELD;

		let addFieldModal = new UmlCodePropertyModal(this, 'Add new Field', sourceUmlClass.getCode(), _this.codesystemView, relationMetaModelEntityName, mappingAction);

		addFieldModal.showModal().then(function (data) {
			const destinationUmlClass = _this.umlClassManager.getByCode(data.selectedCode);

			const destinationCode = destinationUmlClass.getCode();

			_this.createNewField(sourceUmlClass, destinationUmlClass);
		});
	}

	overlayClickedClassMethod(cell) {
		const _this = this;

		const sourceUmlClass = _this.umlClassManager.getByNode(cell);

		const relationMetaModelEntityName = this.getMetaModelMapper().getClassMethodRelationEntityName();
		const mappingAction = MappingAction.ADD_CLASS_METHOD;

		let addMethodModal = new UmlCodePropertyModal(this, 'Add new Method', sourceUmlClass.getCode(), _this.codesystemView, relationMetaModelEntityName, mappingAction);

		addMethodModal.showModal().then(function (data) {
			const destinationUmlClass = _this.umlClassManager.getByCode(data.selectedCode);

			_this.createNewMethod(sourceUmlClass, destinationUmlClass);
		});
	}

	exchangeCodeMetaModelEntities(umlClass, oldMetaModelEntityIds) {
		const oldUmlClass = new UmlClass(Object.assign({}, umlClass.getCode()), umlClass.getNode());
		oldUmlClass.getCode().mmElementIDs = oldMetaModelEntityIds;

		console.log('Is it possible to apply new mappings?');

		console.log('Check the node...');

		let oldNodeAction = this.metaModelMapper.evaluateCode(oldUmlClass);
		let newNodeAction = this.metaModelMapper.evaluateCode(umlClass);
		console.log('Previous node action: ' + oldNodeAction);
		console.log('Current node action: ' + newNodeAction);

		if (oldNodeAction != newNodeAction) {
			console.log('Something changed...');

			console.log('Undo old action...');

			this.metaModelRunner.undoAction(oldNodeAction, {
				'umlClass': umlClass
			});
			this.metaModelRunner.runAction(newNodeAction, {
				'umlClass': umlClass
			});

			console.log('Apply new action...');
		}

		console.log('Done with the node.');

		console.log('Check the outgoing relations...');

		if (umlClass.getCode().relations != null) {
			for (let i = 0; i < umlClass.getCode().relations.length; i++) {
				let relation = umlClass.getCode().relations[i];

				let destinationUmlClass = this.umlClassManager.getByCodeId(relation.codeId);
				let oldDestinationUmlClass = destinationUmlClass;

				// Source == Destination
				if (oldDestinationUmlClass.getCode().codeID == oldUmlClass.getCode().codeID) {
					oldDestinationUmlClass = oldUmlClass;
				}

				this.checkSingleRelation(relation.mmElementId, umlClass, destinationUmlClass, oldUmlClass, oldDestinationUmlClass);
			}
		}

		console.log('Done with the outgoing relations.');

		console.log('Check the incoming relations...');

		this.umlClassManager.getAll().forEach((uml) => {
			let umlCode = uml.getCode();
			// Ignore the current code
			if (umlCode.codeID != umlClass.getCode().codeID) {
				if (umlCode.relations != null) {
					umlCode.relations.forEach((relation) => {
						if (relation.codeId == umlClass.getCode().codeID) {
							let sourceUmlClass = uml;
							let oldSourceUmlClass = sourceUmlClass;

							// Source == Destination
							if (oldSourceUmlClass.getCode().codeID == oldUmlClass.getCode().codeID) {
								oldSourceUmlClass = oldUmlClass;
							}

							this.checkSingleRelation(relation.mmElementId, sourceUmlClass, umlClass, oldSourceUmlClass, oldUmlClass);
						}
					});
				}
			}
		});

		console.log('Done with the incoming relations.')
	}

	checkSingleRelation(relationMetaModelElementId, sourceUmlClass, destinationUmlClass, oldActionSource, oldActionDestination) {
		let relationMetaModelEntity = this.getMetaModelEntityById(relationMetaModelElementId);

		console.log('We are at relation ' + sourceUmlClass.getCode().name + ' -> ' + destinationUmlClass.getCode().name + ' now. (' + relationMetaModelEntity.name + ')');

		let oldRelation = new UmlClassRelation(oldActionSource, oldActionDestination, relationMetaModelEntity);
		let currentRelation = this.umlClassRelationManager.get(sourceUmlClass, destinationUmlClass, relationMetaModelEntity);

		let oldAction = this.metaModelMapper.evaluateCodeRelation(oldRelation);
		let newAction = this.metaModelMapper.evaluateCodeRelation(currentRelation);

		console.log('Previous node action: ' + oldAction);
		console.log('Current node action: ' + newAction);

		if (oldAction != newAction) {
			console.log('Something changed.');

			this.metaModelRunner.undoAction(oldAction, {
				umlClassRelation: currentRelation
			});

			console.log('Undid old action.');

			this.metaModelRunner.runAction(newAction, {
				umlClassRelation: currentRelation
			});

			console.log('Applied new action.');
		}
	}

	onZoom(percentage) {
		this.umlEditor.toolbar.onZoom(percentage);
	}

	render() {
		const _this = this;

		return (
			<StyledUmlEditor>
                <Toolbar ref={(toolbar) => {_this.toolbar = toolbar}} className="row no-gutters" umlEditor={_this} />
                <UmlGraphView ref={(umlGraphView) => {_this.umlGraphView = umlGraphView}} umlEditor={_this} onZoom={_this.onZoom} />
            </StyledUmlEditor>
		);
	}
}