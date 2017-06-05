import {
	EdgeType
} from './EdgeType.js';
import UmlClass from './UmlClass.js';

import UmlCodePositionEndpoint from '../../common/endpoints/UmlCodePositionEndpoint';

export default class UmlEditorView {

	constructor(codeSystemId, container) {
		this.codeSystemId = codeSystemId;
		this.graph = null;
		this.layout = null;

		this.umlClasses = [];

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
					let umlClass = _this.umlClasses.find((umlClass) => umlClass.getNode().getId() == cell.getId());
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

	initGraph(codes, mmEntities, metaModelMapper) {
		this.umlClasses = [];

		let relations = [];

		for (let i = 0; i < codes.length; i++) {
			// Add node to graph
			let node = this.addNode(codes[i].name);

			// Logging
			console.log('Added new node to the graph: ' + codes[i].name + ' (' + codes[i].codeID + ')');

			// Register new entry
			this.umlClasses.push(new UmlClass(codes[i], node));

			// Register code relations
			if (codes[i].relations != null) {
				for (let j = 0; j < codes[i].relations.length; j++) {

					let startCode = codes[i];
					let relation = startCode.relations[j];

					relations.push({
						'start': startCode.codeID,
						'end': relation.codeId,
						'metaModelEntityId': relation.mmElementId
					});
				}
			}
		}

		// Process code relations
		for (let i = 0; i < relations.length; i++) {
			let relation = relations[i];

			let metaModelEntity = mmEntities.find((mmEntity) => mmEntity.id == relation.metaModelEntityId);

			let startUmlClass = this.umlClasses.find((umlClass) => umlClass.getCode().codeID == relation.start);
			let endUmlClass = this.umlClasses.find((umlClass) => umlClass.getCode().codeID == relation.end);
			let startCode = startUmlClass.getCode();
			let endCode = endUmlClass.getCode();

			// Logging
			console.log('Connection between ' + startCode.name + ' (' + startCode.codeID + ') and ' + endCode.name + ' (' + endCode.codeID + ').');

			metaModelMapper.map(metaModelEntity, startUmlClass, endUmlClass);
		}

		this.initPositions();
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

						if (!exists) {
							let umlCodePosition = {
								'codeId': code.codeID,
								'codeSystemId': _this.codeSystemId,
								'x': node.getGeometry().x,
								'y': node.getGeometry().y
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

					_this.translateNode(umlClass.getNode(), umlCodePosition.x, umlCodePosition.y);
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

	applyLayout() {
		let parent = this.graph.getDefaultParent();

		this.graph.getModel().beginUpdate();

		try {
			this.layout.execute(parent);
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

	addClass(name) {
		let fields = new mxCell('', new mxGeometry(0, 0, 0, 0), 'foldable=0;movable=0;line;html=1;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=3;spacingRight=3;rotatable=0;labelPosition=right;points=[];portConstraint=eastwest;');
		fields.vertex = true;

		let methods = new mxCell('', new mxGeometry(0, 0, 0, 0), 'foldable=0;movable=0;html=1;strokeColor=none;strokeWidth=0;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=3;spacingRight=3;rotatable=0;labelPosition=right;points=[];portConstraint=eastwest;');
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
		const simplefieldstyle = 'foldable=0;movable=0;text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;whiteSpace=wrap;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;';

		let simplefield = new mxCell(text, new mxGeometry(0, 0, 160, 15), simplefieldstyle);
		simplefield.vertex = true;

		let fields = node.children[0];
		fields.insert(simplefield);

		this.recalculateNodeSize(node);
	}

	addClassMethod(node, text) {
		const simplefieldstyle = 'foldable=0;movable=0;text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;whiteSpace=wrap;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;';

		let simplemethod = new mxCell(text, new mxGeometry(0, 0, 160, 15), simplefieldstyle);
		simplemethod.vertex = true;

		let methods = node.children[1];
		methods.insert(simplemethod);

		this.recalculateNodeSize(node);
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
}