import React from 'react';
import styled from 'styled-components';

import {
	EdgeType
} from './EdgeType.js';
import UmlClass from './model/UmlClass.js';
import UmlClassRelation from './model/UmlClassRelation.js';
import UmlCodePropertyModal from '../../common/modals/UmlCodePropertyModal';

import HoverButtons from './hoverbutton/HoverButtons.jsx';

import UmlCodePositionEndpoint from '../../common/endpoints/UmlCodePositionEndpoint';

const StyledGraphView = styled.div `
    overflow: hidden;
    cursor: default;
    height: calc(100% - 51px);
`;

export default class UmlGraphView extends React.Component {

	constructor(props) {
		super(props);

		this.umlClassHeaderHeight = 25;
		this.umlClassFieldHeight = 19;
		this.umlClassFieldOffsetLeft = 3;
		this.umlClassFieldOffsetRight = 3;
		this.umlClassFieldsEmptyHeight = 10;
		this.umlClassFieldsOffsetTop = 3;
		this.umlClassFieldsOffsetBottom = 3;
		this.umlClassMethodHeight = 19;
		this.umlClassMethodOffsetLeft = 3;
		this.umlClassMethodOffsetRight = 3;
		this.umlClassMethodsEmptyHeight = 10;
		this.umlClassMethodsOffsetTop = 3;
		this.umlClassMethodsOffsetBottom = 3;

		this.zoomOffset = 10;
		this.minZoomPercentage = 10;
		this.maxZoomPercentage = 150;


		this.umlEditor = this.props.umlEditor;

		this.umlGraphContainer = null;
		this.hoverButtons = null;

		this.graph = null;
		this.layout = null;

		this.cellMarker = null;
		this.connectionHandler = null;

		this.connectionEdgeStartCell = null;

		this.panning = false;

		this.lastSelectedCells = null;
	}

	isConnectingEdge() {
		return this.connectionEdgeStartCell != null;
	}

	componentDidMount() {
		this.initialize();
	}

	initialize() {
		const container = this.umlGraphContainer;

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

		// Styling
		mxConstants.VERTEX_SELECTION_COLOR = '#00A2E8';
		mxConstants.VERTEX_SELECTION_DASHED = false;
		mxConstants.VERTEX_SELECTION_STROKEWIDTH = 1;
		mxConstants.EDGE_SELECTION_COLOR = '#00A2E8';
		mxConstants.EDGE_SELECTION_DASHED = false;
		mxConstants.EDGE_SELECTION_STROKEWIDTH = 1;
		mxConstants.OUTLINE_COLOR = '#00A2E8';
		mxConstants.OUTLINE_STROKEWIDTH = 1;
		mxConstants.OUTLINE_HANDLE_STROKECOLOR = '#00A2E8';
		mxConstants.OUTLINE_HIGHLIGHT_COLOR = '#00A2E8';
		mxConstants.OUTLINE_HIGHLIGHT_STROKEWIDTH = 1;
		mxConstants.DEFAULT_VALID_COLOR = '#00A2E8';
		mxConstants.HIGHLIGHT_COLOR = '##00A2E8';
		mxConstants.HIGHLIGHT_STROKEWIDTH = 1;
		mxConstants.HIGHLIGHT_SIZE = 1;

		mxConstants.VALID_COLOR = '#00A2E8';
		mxConstants.INVALID_COLOR = '#FF0000';

		mxCellHighlight.prototype.spacing = 0;

		// Enables rubberband selection
		new mxRubberband(this.graph);

		// GraphHandler
		new mxGraphHandler(this.graph);

		// Initialize styles
		this.initializeStyles();

		// Initialize layouting
		this.initializeLayouting();

		// Initialize connections
		this.initializeConnections();

		// Initialize panning
		this.initializePanning();

		// Initialize events
		this.initializeEvents();
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
		style[mxConstants.STYLE_STROKEWIDTH] = 1;
		stylesheet.putCellStyle(EdgeType.GENERALIZATION, style);

		// Dependency
		style = {};
		style[mxConstants.STYLE_STARTARROW] = 'none';
		style[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_OPEN;
		style[mxConstants.STYLE_DASHED] = 1;
		style[mxConstants.STYLE_STROKEWIDTH] = 1;
		stylesheet.putCellStyle(EdgeType.DEPENDENCY, style);

		// Aggregation
		style = {};
		style[mxConstants.STYLE_STARTARROW] = mxConstants.ARROW_DIAMOND_THIN;
		style[mxConstants.STYLE_ENDARROW] = 'none';
		style[mxConstants.STYLE_STARTFILL] = 0;
		style[mxConstants.STYLE_STARTSIZE] = 20;
		style[mxConstants.STYLE_STROKEWIDTH] = 1;
		stylesheet.putCellStyle(EdgeType.AGGREGATION, style);

		// Containment
		style = {};
		style[mxConstants.STYLE_STARTARROW] = mxConstants.ARROW_DIAMOND_THIN;
		style[mxConstants.STYLE_ENDARROW] = 'none';
		style[mxConstants.STYLE_STARTFILL] = 1;
		style[mxConstants.STYLE_STARTSIZE] = 20;
		style[mxConstants.STYLE_STROKEWIDTH] = 1;
		stylesheet.putCellStyle(EdgeType.CONTAINMENT, style);

		// Association
		style = {};
		style[mxConstants.STYLE_STARTARROW] = 'none';
		style[mxConstants.STYLE_ENDARROW] = 'none';
		style[mxConstants.STYLE_STROKEWIDTH] = 1;
		stylesheet.putCellStyle(EdgeType.ASSOCIATION, style);

		// Directed Association
		style = {};
		style[mxConstants.STYLE_STARTARROW] = 'none';
		style[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_OPEN;
		style[mxConstants.STYLE_STROKEWIDTH] = 1;
		stylesheet.putCellStyle(EdgeType.DIRECTED_ASSOCIATION, style);

		// Realization
		style = {};
		style[mxConstants.STYLE_STARTARROW] = 'none';
		style[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_BLOCK;
		style[mxConstants.STYLE_ENDFILL] = 0;
		style[mxConstants.STYLE_DASHED] = 1;
		style[mxConstants.STYLE_STROKEWIDTH] = 1;
		stylesheet.putCellStyle(EdgeType.REALIZATION, style);
	}

	initializeLayouting() {
		// Enables layouting
		this.layout = new mxFastOrganicLayout(this.graph);
		this.layout.disableEdgeStyle = false;
		this.layout.forceConstant = 180;
		this.layout.forceConstantSquared = 180 * 180;
	}

	initializeConnections() {
		const _this = this;

		this.connectionEdgeStartCell = null;

		// Cell Marker
		this.cellMarker = new mxCellMarker(this.graph);

		// Mouse listener
		const connectionMouseListener = {
			mouseDown: function (sender, me) {},
			mouseMove: function (sender, me) {},
			mouseUp: function (sender, me) {
				if (_this.isConnectingEdge()) {
					me.consumed = false;
					_this.cellMarker.process(me);
				}
			}
		};

		_this.graph.addMouseListener(connectionMouseListener);

		// Connection Handler
		this.connectionHandler = new mxConnectionHandler(this.graph, function (source, target, style) {
			const edge = new mxCell('', new mxGeometry());
			edge.setEdge(true);
			edge.setStyle(style);
			edge.geometry.relative = true;
			return edge;
		});
		this.connectionHandler.livePreview = true;
		this.connectionHandler.select = false;

		this.connectionHandler.isValidTarget = function (cell) {
			return _this.isCellUmlClass(cell);
		};

		this.connectionHandler.getEdgeWidth = function (valid) {
			return 1;
		};

		this.connectionHandler.addListener(mxEvent.START, function (sender, evt) {
			_this.connectionEdgeStartCell = evt.properties.state.cell;
		});

		this.connectionHandler.addListener(mxEvent.RESET, function (sender, evt) {
			_this.selectCell(_this.connectionEdgeStartCell);

			_this.connectionEdgeStartCell = null;
		});

		this.connectionHandler.addListener(mxEvent.CONNECT, function (sender, evt) {
			_this.cellMarker.process(new mxMouseEvent());

			_this.connectionEdgeStartCell = null;

			const edgeType = evt.properties.cell.style;
			const sourceNode = evt.properties.cell.source;
			const destinationNode = evt.properties.cell.target;

			_this.umlEditor.createNewEdge(sourceNode, destinationNode, edgeType, evt.cell);

			_this.selectCell(sourceNode);
		});
	}

	initializePanning() {
		this.graph.setPanning(true);

		new mxPanningHandler();
	}

	initializeEvents() {
		const _this = this;

		// Mouse wheel
		mxEvent.addMouseWheelListener(function (wheelevt) {
			// Check if the target is the uml editor
			let targetIsUmlEditor = false;

			let currentNode = wheelevt.target;
			while (currentNode != null) {
				if (currentNode.id == 'umlEditorContainer') {
					targetIsUmlEditor = true;
					break;
				}

				currentNode = currentNode.parentNode;
			}

			// Zoom
			if (targetIsUmlEditor) {
				const deltaY = wheelevt.deltaY;

				if (deltaY < 0) {
					_this.zoomIn();
				} else {
					_this.zoomOut();
				}
			}
		});

		// Cells moved
		this.graph.addListener(mxEvent.CELLS_MOVED, function (sender, evt) {
			_this.updateHoverButtons(null, evt.properties.dx * _this.graph.view.scale, evt.properties.dy * _this.graph.view.scale);
		});

		// Panning
		this.graph.panningHandler.addListener(mxEvent.PAN_START, function (sender, evt) {
			_this.panning = true;
		});
		this.graph.panningHandler.addListener(mxEvent.PAN_END, function (sender, evt) {
			_this.panning = false;
			_this.updateHoverButtons();
		});
		this.graph.panningHandler.addListener(mxEvent.PAN, function (sender, evt) {
			_this.updateHoverButtons();
		});

		// Is cell selectable
		this.graph.isCellSelectable = (cell) => {
			if (this.isCellFieldsContainer(cell) || this.isCellMethodsContainer(cell) || this.isCellSeparator(cell)) {
				return false;
			} else {
				return mxGraph.prototype.isCellSelectable(cell);
			}
		};

		// Selection changed
		this.lastSelectedCells = [];

		this.graph.getSelectionModel().addListener(mxEvent.CHANGE, function (sender, evt) {
			var cells = sender.cells;

			if (_this.isConnectingEdge()) {
				return;
			}

			// remove last overlays
			if (_this.lastSelectedCells != null) {
				_this.lastSelectedCells.forEach((cell) => {
					_this.graph.removeCellOverlays(cell);
				});
				_this.hoverButtons.hide();
			}

			// display overlay if one node selected
			if (cells != null && cells.length == 1) {
				let cell = cells[0];

				if (_this.isCellUmlClass(cell)) {
					_this.hoverButtons.show(cell);
					_this.updateHoverButtons(cell);

					let overlays = _this.graph.getCellOverlays(cell);

					if (overlays == null) {
						// Overlay MetaModel
						var overlayMetaModel = new mxCellOverlay(new mxImage('assets/img/overlayButtonMetaModel.png', 34, 30), 'Edit MetaModel', mxConstants.ALIGN_LEFT, mxConstants.ALIGN_TOP, new mxPoint(17, -22));
						overlayMetaModel.cursor = 'pointer';

						overlayMetaModel.addListener(mxEvent.CLICK, function (sender, evt2) {
							_this.umlEditor.overlayClickedMetaModel(cell);
						});

						_this.graph.addCellOverlay(cell, overlayMetaModel);

						// Overlay AddField
						var overlayAddField = new mxCellOverlay(new mxImage('assets/img/overlayButtonAddField.png', 31, 30), 'Add new field', mxConstants.ALIGN_RIGHT, mxConstants.ALIGN_TOP, new mxPoint(-54, -22));
						overlayAddField.cursor = 'pointer';

						overlayAddField.addListener(mxEvent.CLICK, function (sender, evt2) {
							_this.umlEditor.overlayClickedClassField(cell);
						});

						_this.graph.addCellOverlay(cell, overlayAddField);

						// Overlay AddMethod
						var overlayAddMethod = new mxCellOverlay(new mxImage('assets/img/overlayButtonAddMethod.png', 31, 30), 'Add new method', mxConstants.ALIGN_RIGHT, mxConstants.ALIGN_TOP, new mxPoint(-15, -22));
						overlayAddMethod.cursor = 'pointer';

						overlayAddMethod.addListener(mxEvent.CLICK, function (sender, evt2) {
							_this.umlEditor.overlayClickedClassMethod(cell);
						});

						_this.graph.addCellOverlay(cell, overlayAddMethod);

						// Overlay AddEdge
						var overlayAddEdge = new mxCellOverlay(new mxImage('assets/img/overlayButtonAddField.png', 31, 30), 'Add new edge', mxConstants.ALIGN_RIGHT, mxConstants.ALIGN_TOP, new mxPoint(23, 15));
						overlayAddEdge.cursor = 'pointer';

						overlayAddEdge.addListener(mxEvent.CLICK, function (sender, evt2) {
							const handleClick = function (edgeType) {
								let edge = _this.graph.createEdge(null, null, null, null, null, edgeType);
								let edgeState = new mxCellState(_this.graph.view, edge, _this.graph.getCellStyle(edge));

								let cellState = _this.graph.getView().getState(_this.graph.getSelectionCell(), true);

								_this.connectionHandler.start(cellState, 0, 0, edgeState);

								_this.graph.removeCellOverlays(cell);
							};

							// Overlay AddGeneralization
							var overlayAddGeneralization = new mxCellOverlay(new mxImage('assets/img/overlayButtonAddField.png', 31, 30), 'Add new generalization', mxConstants.ALIGN_RIGHT, mxConstants.ALIGN_TOP, new mxPoint(62, 50));
							overlayAddGeneralization.cursor = 'pointer';

							overlayAddGeneralization.addListener(mxEvent.CLICK, function (sender, evt2) {
								handleClick(EdgeType.GENERALIZATION);
							});

							_this.graph.addCellOverlay(cell, overlayAddGeneralization);

							// Overlay AddAggregation
							var overlayAddAggregation = new mxCellOverlay(new mxImage('assets/img/overlayButtonAddField.png', 31, 30), 'Add new aggregation', mxConstants.ALIGN_RIGHT, mxConstants.ALIGN_TOP, new mxPoint(62, 15));
							overlayAddAggregation.cursor = 'pointer';

							overlayAddAggregation.addListener(mxEvent.CLICK, function (sender, evt2) {
								handleClick(EdgeType.AGGREGATION);
							});

							_this.graph.addCellOverlay(cell, overlayAddAggregation);

							// Overlay AddAssociation
							var overlayAddAssociation = new mxCellOverlay(new mxImage('assets/img/overlayButtonAddField.png', 31, 30), 'Add new association', mxConstants.ALIGN_RIGHT, mxConstants.ALIGN_TOP, new mxPoint(62, -20));
							overlayAddAssociation.cursor = 'pointer';

							overlayAddAssociation.addListener(mxEvent.CLICK, function (sender, evt2) {
								handleClick(EdgeType.DIRECTED_ASSOCIATION);
							});

							_this.graph.addCellOverlay(cell, overlayAddAssociation);
						});

						_this.graph.addCellOverlay(cell, overlayAddEdge);
					}
				}
			}

			_this.lastSelectedCells = cells.slice(); // use a copy
		});
	}

	addCellsMovedEventListener(listener) {
		this.graph.addListener(mxEvent.CELLS_MOVED, listener);
	}

	addSelectionChangedEventListener(listener) {
		this.graph.getSelectionModel().addListener(mxEvent.CHANGE, listener);
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

	updateHoverButtons(cell, dx, dy) {
		if (cell == null && this.lastSelectedCells != null && this.lastSelectedCells.length == 1) {
			cell = this.lastSelectedCells[0];
		}

		if (cell != null) {
			const cellGeometry = cell.getGeometry();
			const cellState = this.graph.view.getState(cell);

			let width = cellGeometry.width * this.graph.view.scale;
			let height = cellGeometry.height * this.graph.view.scale;
			let x = cellState.x;
			let y = cellState.y;

			// Panning offset
			if (this.panning) {
				x += this.graph.panningHandler.dx;
				y += this.graph.panningHandler.dy;
			}

			// Additional offset (when moving cells)
			if (dx != null) {
				x += dx;
			}
			if (dy != null) {
				y += dy;
			}

			this.hoverButtons.update(x, y, width, height, this.graph.view.scale);
		}
	}

	resetConnectingEdge() {
		this.connectionHandler.reset();
	}

	clearSelection() {
		this.graph.clearSelection();
	}

	selectCell(cell) {
		this.graph.setSelectionCell(cell);
	}

	selectCells(cells) {
		this.graph.setSelectionCells(cells);
	}

	isCellSelected(cell) {
		return this.graph.isCellSelected(cell);
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
			// TODO use proper style

			// separator
			let separator1 = new mxCell('', new mxGeometry(0, 0, 0, 0), 'strokeColor=black;movable=0;foldable=0;');
			separator1.vertex = true;

			// fields
			let fields = new mxCell('', new mxGeometry(0, 0, 0, 0), 'strokeColor=none;selectable=0;foldable=0;movable=0;html=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=3;spacingRight=3;rotatable=0;labelPosition=right;points=[];portConstraint=eastwest;');
			fields.vertex = true;

			// separator
			let separator2 = new mxCell('', new mxGeometry(0, 0, 0, 0), 'strokeColor=black;movable=0;foldable=0;');
			separator2.vertex = true;

			// methods
			let methods = new mxCell('', new mxGeometry(0, 0, 0, 0), 'selectable=0;foldable=0;movable=0;html=1;strokeColor=none;strokeWidth=0;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=3;spacingRight=3;rotatable=0;labelPosition=right;points=[];portConstraint=eastwest;');
			methods.vertex = true;

			let style = 'fontSize=13;swimlane;html=1;fontStyle=1;strokeWidth=1;align=center;verticalAlign=top;childLayout=stackLayout;';
			let cell = new mxCell(name, new mxGeometry(0, 0, 160, 0), style);
			cell.vertex = true;
			cell.insert(separator1);
			cell.insert(fields);
			cell.insert(separator2);
			cell.insert(methods);

			this.graph.addCell(cell);

			this.recalculateNodeSize(cell);

			node = cell;

		} finally {
			this.graph.getModel().endUpdate();
		}

		return node;
	}

	removeNode(node) {
		this.graph.getModel().beginUpdate();

		try {
			// Remove from selection
			this.graph.getSelectionModel().removeCell(node);

			this.graph.getModel().remove(node);

			node.removeFromParent();

			this.graph.refresh(node);

		} finally {
			this.graph.getModel().endUpdate();
		}
	}

	moveNode(node, x, y) {
		this.graph.getModel().beginUpdate();

		try {
			let dx = (-node.getGeometry().x) + x;
			let dy = (-node.getGeometry().y) + y;

			this.graph.translateCell(node, dx, dy);
		} finally {
			this.graph.getModel().endUpdate();
		}
	}

	renameNode(node, name) {
		node.setValue(name);
		this.graph.refresh(node);
	}

	addClassField(node, fieldName, fieldReturnType) {
		// TODO use proper style
		const style = 'fontStyle=0;selectable=0;foldable=0;movable=0;text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;whiteSpace=wrap;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;';

		const text = '+ ' + fieldName + ': ' + fieldReturnType;

		let field = new mxCell(text, new mxGeometry(0, 0, 160, 15), style);
		field.vertex = true;

		let fields = this.getFieldsContainer(node);

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

	addClassMethod(node, methodName, methodReturnType, methodArguments) {
		if (methodArguments == null) {
			methodArguments = [];
		}

		// TODO use proper style
		const style = 'fontStyle=0;selectable=0;foldable=0;movable=0;text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;whiteSpace=wrap;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;';

		const text = '+ ' + methodName + '(' + methodArguments.join(', ') + '): ' + methodReturnType;

		let method = new mxCell(text, new mxGeometry(0, 0, 160, 15), style);
		method.vertex = true;

		let methods = this.getMethodsContainer(node);

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
		const oldGeo = node.getGeometry();

		let width = oldGeo.width;
		let currentHeight = 0;

		// Header
		currentHeight += this.umlClassHeaderHeight;

		// Separator 1
		const separator1 = this.getSeparator1(node);
		separator1.setGeometry(new mxGeometry(0, currentHeight, width, 0.05));

		currentHeight += 1;

		// Fields
		const fields = this.getFieldsContainer(node);

		let fieldsHeight = this.umlClassFieldsOffsetTop + this.umlClassFieldsOffsetBottom + fields.getChildCount() * this.umlClassFieldHeight;
		if (fields.getChildCount() == 0) {
			fieldsHeight += this.umlClassFieldsEmptyHeight;
		}

		fields.setGeometry(new mxGeometry(0, currentHeight, width, fieldsHeight));

		if (fields.children != null) {
			for (let i = 0; i < fields.children.length; i++) {
				let child = fields.children[i];
				child.setGeometry(new mxGeometry(this.umlClassFieldOffsetLeft, this.umlClassFieldsOffsetTop + i * this.umlClassFieldHeight, width - this.umlClassFieldOffsetLeft - this.umlClassFieldOffsetRight, this.umlClassFieldHeight));
			}
		}

		currentHeight += fieldsHeight;

		// Separator 2
		const separator2 = this.getSeparator2(node);
		separator2.setGeometry(new mxGeometry(0, currentHeight, width, 0.05));

		currentHeight += 1;

		// Methods
		const methods = this.getMethodsContainer(node);

		let methodsHeight = this.umlClassMethodsOffsetTop + this.umlClassMethodsOffsetBottom + methods.getChildCount() * this.umlClassMethodHeight;
		if (methods.getChildCount() == 0) {
			methodsHeight += this.umlClassMethodsEmptyHeight;
		}

		methods.setGeometry(new mxGeometry(0, currentHeight, width, methodsHeight));

		if (methods.children != null) {
			for (let i = 0; i < methods.children.length; i++) {
				let child = methods.children[i];
				child.setGeometry(new mxGeometry(this.umlClassMethodOffsetLeft, this.umlClassMethodsOffsetTop + i * this.umlClassMethodHeight, width - this.umlClassMethodOffsetLeft - this.umlClassMethodOffsetRight, this.umlClassMethodHeight));
			}
		}

		currentHeight += methodsHeight;

		// Node
		node.setGeometry(new mxGeometry(oldGeo.x, oldGeo.y, width, currentHeight));

		this.graph.refresh(node);
	}

	zoomIn() {
		this.zoomTo(this.graph.view.scale * 100 + this.zoomOffset);
	}

	zoomOut() {
		this.zoomTo(this.graph.view.scale * 100 - this.zoomOffset);
	}

	zoomTo(percentage) {
		if (percentage < this.minZoomPercentage) {
			percentage = this.minZoomPercentage;
		} else if (percentage > this.maxZoomPercentage) {
			percentage = this.maxZoomPercentage;
		}

		this.zoom((percentage / 100) / this.graph.view.scale);
	}

	zoom(value) {
		this.graph.zoom(value);

		this.props.onZoom(this.graph.view.scale * 100);

		if (this.graph.view.scale < this.minZoomPercentage / 100) {
			this.zoomTo(this.minZoomPercentage);
			return;
		}

		if (this.graph.view.scale > this.maxZoomPercentage / 100) {
			this.zoomTo(this.maxZoomPercentage);
			return;
		}

		this.updateHoverButtons();
	}

	isCellUmlClass(cell) {
		return cell != null && cell.vertex == true && cell.parent == this.graph.getDefaultParent() && cell.children != null && cell.children.length == this.getUmlClassChildrenCount();
	}

	isCellSeparator(cell) {
		const parent = cell.parent;
		return cell.vertex == true && this.isCellUmlClass(parent) && (this.getSeparator1(parent) == cell || this.getSeparator2(parent) == cell);
	}

	isCellFieldsContainer(cell) {
		const parent = cell.parent;
		return cell.vertex == true && this.isCellUmlClass(parent) && this.getFieldsContainer(parent) == cell;
	}

	isCellMethodsContainer(cell) {
		const parent = cell.parent;
		return cell.vertex == true && this.isCellUmlClass(parent) && this.getMethodsContainer(parent) == cell;
	}

	getUmlClassChildrenCount() {
		return 4;
	}

	getFieldsContainer(cell) {
		if (!this.isCellUmlClass(cell)) {
			return null;
		}
		return cell.children[1];
	}

	getMethodsContainer(cell) {
		if (!this.isCellUmlClass(cell)) {
			return null;
		}
		return cell.children[3];
	}

	getSeparator1(cell) {
		if (!this.isCellUmlClass(cell)) {
			return null;
		}
		return cell.children[0];
	}

	getSeparator2(cell) {
		if (!this.isCellUmlClass(cell)) {
			return null;
		}
		return cell.children[2];
	}

	render() {
		const _this = this;

		// mxGraph requires an element that is not a styled-component
		return (
			<StyledGraphView>
                <div ref={(umlGraphContainer) => {_this.umlGraphContainer = umlGraphContainer}} style={{ height: '100%' }}></div>
                <HoverButtons ref={(hoverButtons) => {_this.hoverButtons = hoverButtons}} umlEditor={_this.umlEditor}></HoverButtons>
            </StyledGraphView>
		);
	}
}