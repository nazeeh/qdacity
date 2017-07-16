import React from 'react';

import UmlClass from './model/UmlClass.js';
import UmlClassManager from './model/UmlClassManager.js';
import UmlClassRelation from './model/UmlClassRelation.js';
import UmlClassRelationManager from './model/UmlClassRelationManager.js';

import MetaModelMapper from './mapping/MetaModelMapper.js';
import MetaModelRunner from './mapping/MetaModelRunner.js';

import Toolbar from './toolbar/Toolbar.jsx';
import UmlGraphView from './UmlGraphView.jsx';

import MetaModelEntityEndpoint from '../../common/endpoints/MetaModelEntityEndpoint';
import MetaModelRelationEndpoint from '../../common/endpoints/MetaModelRelationEndpoint';
import UmlCodePositionEndpoint from '../../common/endpoints/UmlCodePositionEndpoint';

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

	componentDidMount() {
		this.loadMetaModel();
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


		this.initializeUmlClasses();

		this.initializeGraph();

		this.initializePositions();
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

			let relationMetaModelEntity = this.mmEntities.find((mmEntity) => mmEntity.id == relation.metaModelEntityId);

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
				_this.umlGraphView.initCellsMovedEventHandler();

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
						let x = 0;
						let y = 0;

						if (node != null) {
							x = node.getGeometry().x;
							y = node.getGeometry().y;
						}

						if (!exists) {
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

					console.log('Inserting ' + unregisteredUmlCodePositions.length + ' unregistered UmlCodePosition entries into the database...');

					UmlCodePositionEndpoint.insertCodePositions(unregisteredUmlCodePositions).then((resp) => {
						let insertedCodePositions = resp.items || [];

						console.log('Inserted ' + insertedCodePositions.length + ' unregistered UmlCodePosition entries into the database.');

						_this.refreshUmlCodePositions(insertedCodePositions);
					});
				}

				umlCodePositions.forEach((umlCodePosition) => {
					let umlClass = _this.umlClassManager.getByCodeId(umlCodePosition.codeId);

					if (umlClass.getNode() != null) {
						_this.moveNode(umlClass.getNode(), umlCodePosition.x, umlCodePosition.y);
					}
				});
			} else {
				console.log('Applying layout');

				// Apply layout
				_this.umlGraphView.applyLayout();

				// Add cells moved event listener 
				// This happens after apply layout - otherwise apply layout triggers the event
				_this.umlGraphView.initCellsMovedEventHandler();

				umlCodePositions = [];

				_this.umlClasses.forEach((umlClass) => {
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

	getMetaModelEntities() {
		return this.mmEntities;
	}

	getMetaModelRelations() {
		return this.mmRelations;
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
		const destainationUmlClass = umlClassRelation.getDestinationUmlClass();

		const relationNode = this.umlGraphView.addEdge(sourceUmlClass.getNode(), destinationUmlClass.getNode(), edgeType);

		this.addRelation(umlClassRelation, relationNode, 'edge ' + edgeType);
	}

	addClassField(umlClassRelation) {
		const sourceUmlClass = umlClassRelation.getSourceUmlClass();
		const destainationUmlClass = umlClassRelation.getDestinationUmlClass();

		const relationNode = this.umlGraphView.addClassField(sourceUmlClass.getNode(), destinationUmlClass.getCode().name + 'TODO returnType');

		this.addRelation(umlClassRelation, relationNode, 'class field');
	}

	addClassMethod(umlClassRelation) {
		const sourceUmlClass = umlClassRelation.getSourceUmlClass();
		const destainationUmlClass = umlClassRelation.getDestinationUmlClass();

		const relationNode = this.umlGraphView.addClassMethod(sourceUmlClass.getNode(), destinationUmlClass.getCode().name + 'TODO returnType', ['TODO', 'ARGUMENTS']);

		this.addRelation(umlClassRelation, relationNode, 'class method');
	}

	addRelation(umlClassRelation, relationNode, relationType) {
		const sourceUmlClass = umlClassRelation.getSourceUmlClass();
		const destainationUmlClass = umlClassRelation.getDestinationUmlClass();

		umlClassRelation.setRelationNode(relationNode);

		console.log('Connection (' + relationType + ') between ' + sourceUmlClass.getCode().name + ' (' + sourceUmlClass.getCode().codeID + ') and ' + destinationUmlClass.getCode().name + ' (' + destinationUmlClass.getCode().codeID + ').');
	}


















	refreshUmlCodePositions(newUmlCodePositions) {
		console.log('Refreshing UmlCodePositions.');

		const _this = this;
		newUmlCodePositions.forEach((newUmlCodePosition) => {
			let umlClass = _this.getByCodeId(newUmlCodePosition.codeId);
			umlClass.setUmlCodePosition(newUmlCodePosition);
		});
	}




















	// TODO remove
	// TODO this does NOT belong here
	calculateRelationIdentifier(relation) {
		return relation.destination + '--' + relation.source + '--' + relation.metaModelEntityId;
	}


	undoAddNode(umlClass) {
		this.umlGraphView.removeNode(umlClass.getNode());
		umlClass.setNode(null);
		this.umlGraphView.onNodesChanged();
	}

	undoAddEdge(sourceUmlClass, destinationUmlClass, relationMetaModelEntity) {
		this.undoRelation(sourceUmlClass, destinationUmlClass, relationMetaModelEntity);
	}

	undoAddClassField(sourceUmlClass, destinationUmlClass, relationMetaModelEntity) {
		this.undoRelation(sourceUmlClass, destinationUmlClass, relationMetaModelEntity);
	}

	undoAddClassMethod(sourceUmlClass, destinationUmlClass, relationMetaModelEntity) {
		this.undoRelation(sourceUmlClass, destinationUmlClass, relationMetaModelEntity);
	}

	undoRelation(sourceUmlClass, destinationUmlClass, relationMetaModelEntity) {
		const relationIdentifier = this.calculateRelationIdentifier(relation);

		this.umlGraphView.removeEdge(this.umlGraphView.umlClassRelations[relationIdentifier].getRelationNode());

		delete this.umlGraphView.umlClassRelations[relationIdentifier];
	}




	addedEdge(edge, edgeType, sourceUmlClass, destinationUmlClass) {
		this.addedRelation('edge', this.getEdgeRelationEntityName(edgeType), edge, sourceUmlClass, destinationUmlClass);
	}

	addedField(fieldNode, sourceUmlClass, destinationUmlClass) {
		this.addedRelation('field', this.getClassFieldRelationEntityName(), fieldNode, sourceUmlClass, destinationUmlClass);
	}

	addedMethod(methodNode, sourceUmlClass, destinationUmlClass) {
		this.addedRelation('method', this.getClassMethodRelationEntityName(), methodNode, sourceUmlClass, destinationUmlClass);
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

	getMetaModelEntityId(name) {
		const mmEntity = this.mmEntities.find((mmEntity) => mmEntity.name == name);
		return mmEntity.id;
	}





























	cellIsUmlClass(cell) {
		return cell.vertex == true && cell.parent == this.graph.getDefaultParent()
	}

	addGraphEventListener(event, func) {
		this.graph.addListener(event, func);
	}

	addGraphSelectionModelEventListener(event, func) {
		this.graph.getSelectionModel().addListener(event, func);
	}


	getCode(codeId) {
		for (let i = 0; i < this.umlClasses.length; i++) {
			let umlClass = this.umlClasses[i];

			if (umlClass.getCode().codeID == codeId) {
				return umlClass.getCode();
			}
		}

		return null;
	}

	getUnmappedCodes() {
		let unmappedCodes = [];

		this.umlClasses.forEach((umlClass) => {
			if (umlClass.getNode() == null) {
				unmappedCodes.push(umlClass.getCode());
			}
		});

		return unmappedCodes;
	}

	exchangeCodeMetaModelEntities(codeId, oldMetaModelEntityIds) {
		const umlClass = this.getByCodeId(codeId);

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

			this.metaModelMapper.undoAction(oldNodeAction, {
				'sourceUmlClass': umlClass
			});
			this.metaModelMapper.runAction(newNodeAction, {
				'sourceUmlClass': umlClass
			});

			console.log('Apply new action...');
		}

		console.log('Done with the node.');

		console.log('Check the outgoing relations...');

		if (umlClass.getCode().relations != null) {
			for (let i = 0; i < umlClass.getCode().relations.length; i++) {
				let relation = umlClass.getCode().relations[i];
				let destinationUmlClass = this.getByCodeId(relation.codeId);
				let oldDestinationUmlClass = destinationUmlClass;

				// Source == Destination
				if (oldDestinationUmlClass.getCode().codeID == oldUmlClass.getCode().codeID) {
					oldDestinationUmlClass = oldUmlClass;
				}

				this.checkSingleRelation(relation, umlClass, destinationUmlClass, oldUmlClass, oldDestinationUmlClass);
			}
		}

		console.log('Done with the outgoing relations.');

		console.log('Check the incoming relations...');

		this.umlClasses.forEach((uml) => {
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

							this.checkSingleRelation(relation, sourceUmlClass, umlClass, oldSourceUmlClass, oldUmlClass);
						}
					});
				}
			}
		});

		console.log('Done with the incoming relations.')
	}

	checkSingleRelation(relation, sourceUmlClass, destinationUmlClass, oldActionSource, oldActionDestination) {
		let relationMetaModelEntity = this.mmEntities.find((mmEntity) => mmEntity.id == relation.mmElementId);

		console.log('We are at relation ' + sourceUmlClass.getCode().name + ' -> ' + destinationUmlClass.getCode().name + ' now. (' + relationMetaModelEntity.name + ')');

		let oldAction = this.metaModelMapper.evaluateCodeRelation(relationMetaModelEntity, oldActionSource, oldActionDestination);
		let newAction = this.metaModelMapper.evaluateCodeRelation(relationMetaModelEntity, sourceUmlClass, destinationUmlClass);

		console.log('Previous node action: ' + oldAction);
		console.log('Current node action: ' + newAction);

		if (oldAction != newAction) {
			console.log('Something changed.');

			relation = {
				'source': sourceUmlClass.getCode().codeID,
				'destination': relation.codeId,
				'metaModelEntityId': relation.mmElementId
			};

			let relationIdentifier = this.metaModelMapper.calculateRelationIdentifier(relation);

			console.log('Undo old action...');

			let params = {
				'sourceUmlClass': sourceUmlClass,
				'destinationUmlClass': destinationUmlClass,
				'relationMetaModelEntity': relationMetaModelEntity,
				'relation': relation
			};
			this.metaModelMapper.undoAction(oldAction, params);
			this.metaModelMapper.runAction(newAction, params);

			console.log('Apply new action...');
		}
	}

	render() {
		return (
			<div>
		        <Toolbar ref={(toolbar) => {this.toolbar = toolbar}} className="row no-gutters" umlEditor={this} />
		        <UmlGraphView ref={(umlGraphView) => {this.umlGraphView = umlGraphView}} umlEditor={this} />
            </div>
		);
	}
}