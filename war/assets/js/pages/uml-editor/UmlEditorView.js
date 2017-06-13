import {
	EdgeType
} from './EdgeType.js';
import UmlClass from './UmlClass.js';
import UmlClassRelation from './UmlClassRelation.js';

import UmlCodePositionEndpoint from '../../common/endpoints/UmlCodePositionEndpoint';

export default class UmlEditorView {

	constructor(codeSystemId, container) {
		this.codeSystemId = codeSystemId;
		this.graph = null;
		this.layout = null;

		this.mmEntities;

		this.umlClasses = [];
		this.umlClassRelations = {};

		this.unmappedCodesView = null;
		this.metaModelMapper = null;

		this.init(container);
	}

	init(container) {
		// Disables the context menu
		mxEvent.disableContextMenu(container);

		// Creates the graph
		this.graph = new mxGraph(container);
		this.graph.setConnectable(false);
		this.graph.setCellsEditable(false);
		this.graph.setAllowDanglingEdges(false);
		this.graph.setAllowLoops(false);
		this.graph.setCellsDeletable(false);
		this.graph.setCellsCloneable(false);
		this.graph.setCellsDisconnectable(false);
		this.graph.setDropEnabled(false);
		this.graph.setSplitEnabled(false);
		this.graph.setCellsBendable(false);

		this.graph.setAutoSizeCells(true);
		this.graph.setPortsEnabled(true);
		this.graph.setEdgeLabelsMovable(false);
		this.graph.setVertexLabelsMovable(false);
		this.graph.setSwimlaneSelectionEnabled(false);
		this.graph.setCellsResizable(false);

		// Enables rubberband selection
		new mxRubberband(this.graph);

		// Highlighting
		var hoverHighlight = new mxCellTracker(this.graph, '#85C8E5');

		// Styling
		mxConstants.VERTEX_SELECTION_COLOR = '#00A2E8';
		mxConstants.OUTLINE_COLOR = '#00A2E8';
		mxConstants.OUTLINE_HANDLE_STROKECOLOR = '#00A2E8';
		mxConstants.EDGE_SELECTION_COLOR = '#00A2E8';
		mxConstants.DEFAULT_VALID_COLOR = '#00A2E8';

		// Enables layouting
		this.layout = new mxFastOrganicLayout(this.graph);
		this.layout.disableEdgeStyle = false;
		this.layout.forceConstant = 180;

		// Initialize styles
		this.initializeStyles();
	}

	initializeStyles() {
		this.initializeDefaultStyles();
		this.initializeCustomStyles();
	}

	initializeDefaultStyles() {
		let style;

		style = this.graph.getStylesheet().getDefaultVertexStyle();
		style[mxConstants.STYLE_FILLCOLOR] = '#FFFFFF';
		style[mxConstants.STYLE_STROKECOLOR] = '#000000';
		style[mxConstants.STYLE_FONTCOLOR] = '#000000';
		style[mxConstants.STYLE_FONTSTYLE] = '1';

		style = this.graph.getStylesheet().getDefaultEdgeStyle();
		style[mxConstants.STYLE_STARTSIZE] = '13';
		style[mxConstants.STYLE_ENDSIZE] = '13';
		style[mxConstants.STYLE_STROKECOLOR] = '#000000';
		style[mxConstants.STYLE_FONTCOLOR] = '#000000';
		style[mxConstants.STYLE_FONTSTYLE] = '0';
		style[mxConstants.STYLE_EDGE] = mxEdgeStyle.SegmentConnector;
		style[mxConstants.STYLE_ROUNDED] = true;
	}

	initializeCustomStyles() {
		const stylesheet = this.graph.getStylesheet();
		let style;

		// Generalization
		style = {};
		style[mxConstants.STYLE_STARTARROW] = 'none';
		style[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_BLOCK;
		style[mxConstants.STYLE_ENDFILL] = 0;
		stylesheet.putCellStyle(EdgeType.GENERALIZATION, style);

		// Dependency
		style = {};
		style[mxConstants.STYLE_STARTARROW] = 'none';
		style[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_OPEN;
		style[mxConstants.STYLE_DASHED] = 1;
		stylesheet.putCellStyle(EdgeType.DEPENDENCY, style);

		// Aggregation
		style = {};
		style[mxConstants.STYLE_STARTARROW] = mxConstants.ARROW_DIAMOND_THIN;
		style[mxConstants.STYLE_ENDARROW] = 'none';
		style[mxConstants.STYLE_STARTFILL] = 0;
		style[mxConstants.STYLE_STARTSIZE] = 20;
		stylesheet.putCellStyle(EdgeType.AGGREGATION, style);

		// Containment
		style = {};
		style[mxConstants.STYLE_STARTARROW] = mxConstants.ARROW_DIAMOND_THIN;
		style[mxConstants.STYLE_ENDARROW] = 'none';
		style[mxConstants.STYLE_STARTFILL] = 1;
		style[mxConstants.STYLE_STARTSIZE] = 20;
		stylesheet.putCellStyle(EdgeType.CONTAINMENT, style);

		// Association
		style = {};
		style[mxConstants.STYLE_STARTARROW] = 'none';
		style[mxConstants.STYLE_ENDARROW] = 'none';
		stylesheet.putCellStyle(EdgeType.ASSOCIATION, style);

		// Directed Association
		style = {};
		style[mxConstants.STYLE_STARTARROW] = 'none';
		style[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_OPEN;
		stylesheet.putCellStyle(EdgeType.DIRECTED_ASSOCIATION, style);

		// Realization
		style = {};
		style[mxConstants.STYLE_STARTARROW] = 'none';
		style[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_BLOCK;
		style[mxConstants.STYLE_ENDFILL] = 0;
		style[mxConstants.STYLE_DASHED] = 1;
		stylesheet.putCellStyle(EdgeType.REALIZATION, style);
	}

	initCellsMovedEventHandler() {
		let _this = this;

		this.graph.addListener(mxEvent.CELLS_MOVED, function (sender, event) {
			let cells = event.properties.cells;
			let dx = event.properties.dx;
			let dy = event.properties.dy;

			let umlCodePositions = [];

			cells.forEach((cell) => {
				if (cell.vertex == true) {
					let umlClass = _this.umlClasses.find((umlClass) => umlClass.getNode() != null ? umlClass.getNode().getId() == cell.getId() : false);
					let code = umlClass.getCode();
					let node = umlClass.getNode();

					umlCodePositions.push({
						'id': -1,
						'codeId': code.codeID,
						'codeSystemId': _this.codeSystemId,
						'x': node.getGeometry().x,
						'y': node.getGeometry().y
					});
				}
			});

			console.log('Updating ' + umlCodePositions.length + ' UmlCodePosition entries in the database...');

			UmlCodePositionEndpoint.updateCodePositions(umlCodePositions).then(function () {
				console.log('Updated ' + umlCodePositions.length + ' UmlCodePosition entries in the database.');
			});
		});
	}

	initGraph(codes, mmEntities, metaModelMapper, unmappedCodesView) {
		this.mmEntities = mmEntities;
		this.metaModelMapper = metaModelMapper;
		this.unmappedCodesView = unmappedCodesView;
		this.umlClasses = [];

		let relations = [];

		for (let i = 0; i < codes.length; i++) {
			// Register new entry
			const umlClass = new UmlClass();
			umlClass.setCode(codes[i]);
			umlClass.setNode(null);
			this.umlClasses.push(umlClass);

			// Add node to graph
			this.metaModelMapper.evaluateAndRunAction({
				'sourceUmlClass': umlClass
			});

			// Logging
			console.log('Added new node to the graph: ' + codes[i].name + ' (' + codes[i].codeID + ')');

			// Register code relations
			if (codes[i].relations != null) {
				for (let j = 0; j < codes[i].relations.length; j++) {

					let sourceCode = codes[i];
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

			let sourceUmlClass = this.umlClasses.find((umlClass) => umlClass.getCode().codeID == relation.source);
			let sourceCode = sourceUmlClass.getCode();
			let destinationUmlClass = this.umlClasses.find((umlClass) => umlClass.getCode().codeID == relation.destination);
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

		this.initPositions();

		this.onNodesChanged();
	}

	initPositions() {
		let _this = this;

		console.log('Loading UmlCodePosition entries from the database...');

		UmlCodePositionEndpoint.listCodePositions(this.codeSystemId).then(function (resp) {
			let umlCodePositions = resp.items || [];

			console.log('Loaded ' + umlCodePositions.length + ' UmlCodePosition entries from the database. Found ' + _this.umlClasses.length + ' codes.');

			if (umlCodePositions.length > 0) {
				// Add cells moved event listener
				_this.initCellsMovedEventHandler();

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

					UmlCodePositionEndpoint.insertCodePositions(unregisteredUmlCodePositions).then(function () {
						console.log('Inserted ' + unregisteredUmlCodePositions.length + ' unregistered UmlCodePosition entries into the database.');
					});
				}

				umlCodePositions.forEach((umlCodePosition) => {
					let umlClass = _this.umlClasses.find((umlClass) => umlClass.getCode().codeID == umlCodePosition.codeId);

					if (umlClass.getNode() != null) {
						_this.translateNode(umlClass.getNode(), umlCodePosition.x, umlCodePosition.y);
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

					umlCodePositions.push({
						'codeId': code.codeID,
						'codeSystemId': _this.codeSystemId,
						'x': node.getGeometry().x,
						'y': node.getGeometry().y
					});
				});

				console.log('Inserting ' + umlCodePositions.length + ' new UmlCodePosition entries into the database...');

				UmlCodePositionEndpoint.insertCodePositions(umlCodePositions).then(function () {
					console.log('Inserted ' + umlCodePositions.length + ' new UmlCodePosition entries into the database.');
				});
			}
		});
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
		const umlClass = this.umlClasses.find((umlClass) => umlClass.getCode().codeID == codeId);

		const oldUmlClass = new UmlClass(Object.assign({}, umlClass.getCode()), umlClass.getNode());
		oldUmlClass.getCode().mmElementIDs = oldMetaModelEntityIds;

		console.log('Is it possible to apply new mappings?');

		console.log('Check the outgoing relations...');

		if (umlClass.getCode().relations != null) {
			for (let i = 0; i < umlClass.getCode().relations.length; i++) {
				let relation = umlClass.getCode().relations[i];
				let destinationUmlClass = this.umlClasses.find((uml) => uml.getCode().codeID == relation.destination);
				checkSingleRelation(relation, umlClass, destinationUmlClass, oldUmlClass, destinationUmlClass);
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
						if (relation.destination == umlClass.getCode().codeID) {
							let sourceUmlClass = this.umlClasses.find((uml) => uml.getCode().codeID == relation.source);
							checkSingleRelation(relation, sourceUmlClass, umlClass, sourceUmlClass, oldUmlClass);
						}
					});

					find((r) => r.destination == umlClass.getCode().codeID);

					if (rel != null) {
						arr.push(rel);
					}
				}
			}
		});

		console.log('Done with the incoming relations.');

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
	}

	checkSingleRelation(relation, sourceUmlClass, destinationUmlClass, oldActionSource, oldActionDestination) {
		let relationMetaModelEntity = this.mmEntities.find((mmEntity) => mmEntity.id == relation.metaModelEntityId);

		console.log('We are at relation ' + sourceUmlClass.getCode().name + ' -> ' + destinationUmlClass.getCode().name + ' now. (' + relationMetaModelEntity.name + ')');

		let oldAction = this.metaModelMapper.evaluateCodeRelation(relationMetaModelEntity, oldActionSource, oldActionDestination);
		let newAction = this.metaModelMapper.evaluateCodeRelation(relationMetaModelEntity, sourceUmlClass, destinationUmlClass);

		console.log('Previous node action: ' + oldNodeAction);
		console.log('Current node action: ' + newNodeAction);

		if (oldAction != newAction) {
			console.log('Something changed...');

			if (!umlClassRelations.hasOwnProperty(this.metaModelMapper(calculateRelationIdentifier(relation)))) {
				throw new Error("ERROR");
			}

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

	applyLayout() {
		let parent = this.graph.getDefaultParent();

		this.graph.getModel().beginUpdate();

		try {
			this.layout.execute(parent);
		} finally {
			this.graph.getModel().endUpdate();
		}
	}

	translateNode(node, x, y) {
		this.graph.getModel().beginUpdate();

		try {
			let dx = (-node.getGeometry().x) + x;
			let dy = (-node.getGeometry().y) + y;

			this.graph.translateCell(node, dx, dy);
		} finally {
			this.graph.getModel().endUpdate();
		}
	}

	addEdge(nodeFrom, nodeTo, edgeType) {
		let parent = this.graph.getDefaultParent();

		this.graph.getModel().beginUpdate();

		let edge;
		try {
			edge = this.graph.insertEdge(parent, null, '', nodeFrom, nodeTo, edgeType);

		} finally {
			this.graph.getModel().endUpdate();
		}

		return edge;
	}

	removeEdge(edge) {
		this.graph.getModel().beginUpdate();

		try {
			edge.removeFromParent();

			this.graph.refresh(edge);

		} finally {
			this.graph.getModel().endUpdate();
		}
	}

	addNode(name) {
		let parent = this.graph.getDefaultParent();

		this.graph.getModel().beginUpdate();

		let node;
		try {
			node = this.addClass(name);
		} finally {
			this.graph.getModel().endUpdate();
		}

		return node;
	}

	removeNode(node) {
		this.graph.getModel().beginUpdate();

		try {
			node.removeFromParent();

			this.graph.refresh(node);

		} finally {
			this.graph.getModel().endUpdate();
		}
	}

	addClass(name) {
		let fields = new mxCell('', new mxGeometry(0, 0, 0, 0), 'selectable=0;foldable=0;movable=0;line;html=1;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=3;spacingRight=3;rotatable=0;labelPosition=right;points=[];portConstraint=eastwest;');
		fields.vertex = true;

		let methods = new mxCell('', new mxGeometry(0, 0, 0, 0), 'selectable=0;foldable=0;movable=0;html=1;strokeColor=none;strokeWidth=0;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=3;spacingRight=3;rotatable=0;labelPosition=right;points=[];portConstraint=eastwest;');
		methods.vertex = true;

		let style = 'fontSize=13;swimlane;html=1;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;';
		let cell = new mxCell(name, new mxGeometry(0, 0, 160, 0), style);
		cell.vertex = true;
		cell.insert(fields);
		cell.insert(methods);

		this.graph.addCell(cell);

		this.recalculateNodeSize(cell);

		return cell;
	}

	addClassField(node, text) {
		const style = 'selectable=0;foldable=0;movable=0;text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;whiteSpace=wrap;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;';

		let field = new mxCell(text, new mxGeometry(0, 0, 160, 15), style);
		field.vertex = true;

		let fields = node.children[0];

		this.graph.getModel().beginUpdate();

		try {
			fields.insert(field);

			this.recalculateNodeSize(node);

		} finally {
			this.graph.getModel().endUpdate();
		}

		return field;
	}

	removeClassField(node, field) {
		this.graph.getModel().beginUpdate();

		try {
			field.removeFromParent();

			this.graph.refresh(field);

			this.recalculateNodeSize(node);

		} finally {
			this.graph.getModel().endUpdate();
		}
	}

	addClassMethod(node, text) {
		const style = 'selectable=0;foldable=0;movable=0;text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;whiteSpace=wrap;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;';

		let method = new mxCell(text, new mxGeometry(0, 0, 160, 15), style);
		method.vertex = true;

		let methods = node.children[1];

		this.graph.getModel().beginUpdate();

		try {
			methods.insert(method);

			this.recalculateNodeSize(node);

		} finally {
			this.graph.getModel().endUpdate();
		}

		return method;
	}

	removeClassMethod(node, method) {
		this.graph.getModel().beginUpdate();

		try {
			method.removeFromParent();

			this.graph.refresh(method);

			this.recalculateNodeSize(node);

		} finally {
			this.graph.getModel().endUpdate();
		}
	}

	recalculateNodeSize(node) {
		let fields = node.children[0];
		let fieldsHeight = 5 + 5 + 15 * fields.getChildCount();


		let methods = node.children[1];
		let methodsHeight = 5 + 5 + 15 * methods.getChildCount();


		let oldGeo = node.getGeometry();
		let width = oldGeo.width;
		node.setGeometry(new mxGeometry(oldGeo.x, oldGeo.y, width, 30 + fieldsHeight + methodsHeight));

		fields.setGeometry(new mxGeometry(0, 30, width, fieldsHeight));
		methods.setGeometry(new mxGeometry(0, 30 + fieldsHeight, width, methodsHeight));


		if (fields.children != null) {
			for (let i = 0; i < fields.children.length; i++) {
				let child = fields.children[i];
				child.setGeometry(new mxGeometry(0, i * 15, width, 15));
			}
		}

		if (methods.children != null) {
			for (let i = 0; i < methods.children.length; i++) {
				let child = methods.children[i];
				child.setGeometry(new mxGeometry(0, i * 15, width, 15));
			}
		}
	}

	zoomIn() {
		this.graph.zoomIn();
	}

	zoomOut() {
		this.graph.zoomOut();
	}

	zoom(percentage) {
		this.graph.zoomTo(percentage / 100.0, false);
	}
}