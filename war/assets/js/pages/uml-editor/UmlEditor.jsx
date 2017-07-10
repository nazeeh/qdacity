import React from 'react';

import Toolbar from './toolbar/Toolbar.jsx';
import MetaModelMapper from './MetaModelMapper.js';
import UmlGraphView from './UmlGraphView.jsx';

export default class UmlEditor extends React.Component {

	constructor(props) {
		super(props);

		this.umlGraphView = null;
		this.toolbar = null;

		this.metaModelMapper = null;

		this.codesystem = this.props.codesystem;
		this.mmEntities = this.props.mmEntities;
		this.mmRelation = this.props.mmRelations;

		/*
        this.codeSystemId = this.props.codeSystemId;

        this.codesystem = null;

        this.umlClasses = [];
        this.umlClassRelations = {};
        */
	}

	componentDidMount() {
		this.metaModelMapper = new MetaModelMapper(umlGraphView, mmEntities);

		this.initialize(this.props.codes, this.props.mmEntities, this.props.mmRelations);
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

	initialize() {
		this.umlClasses = [];

		let relations = [];

		for (let i = 0; i < this.codesystem.length; i++) {
			const code = this.codesystem[i];

			// Register new entry
			const umlClass = new UmlClass();
			umlClass.setCode(code);
			umlClass.setNode(null);
			this.umlClasses.push(umlClass);

			// Add node to graph
			this.metaModelMapper.evaluateAndRunAction({
				'sourceUmlClass': umlClass
			});

			// Logging
			console.log('Added new node to the graph: ' + code.name + ' (' + code.codeID + ')');

			// Register code relations
			if (code.relations != null) {
				for (let j = 0; j < code.relations.length; j++) {

					let sourceCode = code;
					let relation = sourceCode.relations[j];

					relations.push({
						'source': sourceCode.codeID,
						'destination': relation.codeId,
						'metaModelEntityId': relation.mmElementId
					});
				}
			}
		}

		// Process code relations
		for (let i = 0; i < relations.length; i++) {
			let relation = relations[i];

			let relationMetaModelEntity = this.mmEntities.find((mmEntity) => mmEntity.id == relation.metaModelEntityId);

			let sourceUmlClass = this.getUmlClassByCodeId(relation.source);
			let sourceCode = sourceUmlClass.getCode();
			let destinationUmlClass = this.getUmlClassByCodeId(relation.destination);
			let destinationCode = destinationUmlClass.getCode();

			// Logging
			console.log('Connection between ' + sourceCode.name + ' (' + sourceCode.codeID + ') and ' + destinationCode.name + ' (' + destinationCode.codeID + ').');

			this.metaModelMapper.evaluateAndRunAction({
				'sourceUmlClass': sourceUmlClass,
				'destinationUmlClass': destinationUmlClass,
				'relationMetaModelEntity': relationMetaModelEntity,
				'relation': relation
			});
		}

		this.initializePositions();

		this.onNodesChanged();
	}

	initializePositions() {
		let _this = this;

		console.log('Loading UmlCodePosition entries from the database...');

		UmlCodePositionEndpoint.listCodePositions(this.codeSystemId).then(function (resp) {
			let umlCodePositions = resp.items || [];

			console.log('Loaded ' + umlCodePositions.length + ' UmlCodePosition entries from the database. Found ' + _this.umlClasses.length + ' codes.');

			if (umlCodePositions.length > 0) {
				// Add cells moved event listener
				_this.initCellsMovedEventHandler();

				// Set CodePositions
				_this.refreshUmlCodePositions(umlCodePositions);

				// Unregistered codes exist
				if (umlCodePositions.length != _this.umlClasses.length) {
					// Find new codes
					let unregisteredUmlCodePositions = [];

					_this.umlClasses.forEach((umlClass) => {
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
								'codeSystemId': _this.codeSystemId,
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
					let umlClass = _this.getUmlClassByCodeId(umlCodePosition.codeId);

					if (umlClass.getNode() != null) {
						_this.moveNode(umlClass.getNode(), umlCodePosition.x, umlCodePosition.y);
					}
				});
			} else {
				console.log('Applying layout');

				// Apply layout
				_this.applyLayout();

				// Add cells moved event listener 
				// This happens after apply layout - otherwise apply layout triggers the event
				_this.initCellsMovedEventHandler();

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
						'codeSystemId': _this.codeSystemId,
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

	refreshUmlCodePositions(newUmlCodePositions) {
		console.log('Refreshing UmlCodePositions.');

		const _this = this;
		newUmlCodePositions.forEach((newUmlCodePosition) => {
			let umlClass = _this.getUmlClassByCodeId(newUmlCodePosition.codeId);
			umlClass.setUmlCodePosition(newUmlCodePosition);
		});
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

	getMetaModelEntities() {
		return this.mmEntities;
	}

	getMetaModelRelations() {
		return this.mmRelations;
	}

	getUmlClassByCode(code) {
		return this.getUmlClassByCodeId(code.codeID);
	}

	getUmlClassByCodeId(codeId) {
		return this.umlClasses.find((umlClass) => umlClass.getCode() != null && umlClass.getCode().codeID == codeId);
	}

	getUmlClassByNode(node) {
		return this.getUmlClassByNodeId(node.mxObjectId);
	}

	getUmlClassByNodeId(mxObjectId) {
		return this.umlClasses.find((umlClass) => umlClass.getNode() != null && umlClass.getNode().mxObjectId == mxObjectId);
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

	onNodesChanged() {
		this.unmappedCodesView.update();
	}

	exchangeCodeMetaModelEntities(codeId, oldMetaModelEntityIds) {
		const umlClass = this.getUmlClassByCodeId(codeId);

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
				let destinationUmlClass = this.getUmlClassByCodeId(relation.codeId);
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
			<div className="col-sm-8 col-md-9 col-lg-10">
		        <Toolbar ref={(toolbar) => {this.toolbar = toolbar}} className="row no-gutters" umlEditor={this} />
                <UmlGraphView ref={(toolbar) => {this.umlGraphView = umlGraphView}} umlEditor={this} />
	        </div>
		);
	}
}