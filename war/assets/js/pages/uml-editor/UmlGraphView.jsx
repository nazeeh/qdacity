import React from 'react';
import styled from 'styled-components';

import CellValue from './CellValue.js';

import {
	EdgeType
} from './EdgeType.js';
import UmlClass from './model/UmlClass.js';
import UmlClassRelation from './model/UmlClassRelation.js';

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

		this.umlClassHeaderHeight = 26;
		this.umlClassHeaderOffsetLeft = 10;
		this.umlClassHeaderOffsetRight = 10;
		this.umlClassSeparatorHeight = 1;

		this.umlClassFieldHeight = 20;
		this.umlClassFieldOffsetLeft = 6;
		this.umlClassFieldOffsetRight = 6;
		this.umlClassFieldsEmptyHeight = this.umlClassFieldHeight;
		this.umlClassFieldsOffsetTop = 4;
		this.umlClassFieldsOffsetBottom = 4;
		this.umlClassAddClassFieldHeight = this.umlClassFieldHeight;

		this.umlClassMethodHeight = this.umlClassFieldHeight;
		this.umlClassMethodOffsetLeft = this.umlClassFieldOffsetLeft;
		this.umlClassMethodOffsetRight = this.umlClassFieldOffsetRight;
		this.umlClassMethodsEmptyHeight = this.umlClassFieldsEmptyHeight;
		this.umlClassMethodsOffsetTop = this.umlClassFieldsOffsetTop;
		this.umlClassMethodsOffsetBottom = this.umlClassFieldsOffsetBottom;
		this.umlClassAddClassMethodHeight = this.umlClassMethodHeight;

		this.umlClassMinimumWidth = 160;
		this.umlClassMaximumWidth = 300;
		this.umlClassDefaultWidth = 160;
		this.umlClassDefaultHeight = 59; // TODO fix => neu berechnen oder dynamisch belegen (header + fields + methods + 2x sep)


		this.zoomOffset = 10;
		this.minZoomPercentage = 10;
		this.maxZoomPercentage = 150;

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

		// Enables HTML markup in all labels
		this.graph.setHtmlLabels(true);


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


		mxGraphHandler.prototype.htmlPreview = true;

		mxGraphView.prototype.optimizeVmlReflows = false;

		mxClient.NO_FO = true;


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

		// Initialize node rendering
		this.initializeNodeRendering();

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
		this.layout.forceConstant = 200;
		this.layout.forceConstantSquared = this.layout.forceConstant * this.layout.forceConstant;
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

			_this.props.umlEditor.createNewEdge(sourceNode, destinationNode, edgeType, evt.cell);

			_this.selectCell(sourceNode);
		});
	}

	initializePanning() {
		this.graph.setPanning(true);

		new mxPanningHandler();
	}

	initializeNodeRendering() {
		const _this = this;

		// Html content of the node
		this.graph.getLabel = function (cell) {
			if (_this.graph.getModel().isVertex(cell)) {
				if (_this.graph.isCellCollapsed(cell)) {
					// TODO
					return '';
				} else {
					const cellValue = cell.value;

					// Header
					let header = '<div class="umlClassHeader" '
						+ 'style="height:' + _this.umlClassHeaderHeight + 'px; line-height:' + _this.umlClassHeaderHeight + 'px; margin-left:' + _this.umlClassHeaderOffsetLeft + 'px; width:calc(100% - ' + (_this.umlClassHeaderOffsetLeft + _this.umlClassHeaderOffsetRight) + 'px);"'
						+ '>' + cellValue.getName() + '</div>';

					// Separator
					let separator = '<div class="umlClassSeparator" style="height:' + _this.umlClassSeparatorHeight + 'px;"></div>';

					// Fields
					let fields = '<div class="umlClassFields" style="padding-top:' + _this.umlClassFieldsOffsetTop + 'px; padding-bottom:' + _this.umlClassFieldsOffsetBottom + 'px;">';

					let addFieldButton = '<div style="width:calc(100% - ' + (_this.umlClassFieldOffsetLeft + _this.umlClassFieldOffsetRight) + 'px); height:' + _this.umlClassAddClassFieldHeight + 'px; line-height:' + _this.umlClassAddClassFieldHeight + 'px; margin-left:' + _this.umlClassFieldOffsetLeft + 'px;">';
					addFieldButton += '<a class="umlClassAddFieldLink">+ Add Field</a>';
					addFieldButton += '</div>';

					if (cellValue.getFields() != null && cellValue.getFields().length > 0) {
						for (let i = 0; i < cellValue.getFields().length; i++) {
							fields += '<div class="umlClassField" style="width:calc(100% - ' + (_this.umlClassFieldOffsetLeft + _this.umlClassFieldOffsetRight) + 'px); height:' + _this.umlClassFieldHeight + 'px; line-height:' + _this.umlClassFieldHeight + 'px; margin-left:' + _this.umlClassFieldOffsetLeft + 'px;">';
							fields += cellValue.getFields()[i];
							fields += '</div>';
						}

						// Is selected
						if (_this.graph.isCellSelected(cell) && _this.graph.getSelectionCount() == 1) {
							fields += addFieldButton;
						}

					} else {
						// Is selected
						if (_this.graph.isCellSelected(cell) && _this.graph.getSelectionCount() == 1) {
							fields += addFieldButton;
						} else {
							fields += '<div class="umlClassFieldsEmpty" style="height:' + _this.umlClassFieldsEmptyHeight + 'px;"></div>';
						}
					}

					fields += '</div>';

					// Methods
					let methods = '<div class="umlClassMethods" style="padding-top:' + _this.umlClassMethodsOffsetTop + 'px; padding-bottom:' + _this.umlClassMethodsOffsetBottom + 'px;">';

					let addMethodButton = '<div style="width:calc(100% - ' + (_this.umlClassMethodOffsetLeft + _this.umlClassMethodOffsetRight) + 'px); height:' + _this.umlClassAddClassMethodHeight + 'px; line-height:' + _this.umlClassAddClassMethodHeight + 'px; margin-left:' + _this.umlClassMethodOffsetLeft + 'px;">';
					addMethodButton += '<a class="umlClassAddMethodLink">+ Add Method</a>';
					addMethodButton += '</div>';

					if (cellValue.getMethods() != null && cellValue.getMethods().length > 0) {
						for (let i = 0; i < cellValue.getMethods().length; i++) {
							methods += '<div class="umlClassMethod" style="width:calc(100% - ' + (_this.umlClassMethodOffsetLeft + _this.umlClassMethodOffsetRight) + 'px); height:' + _this.umlClassMethodHeight + 'px; line-height:' + _this.umlClassMethodHeight + 'px; margin-left:' + _this.umlClassMethodOffsetLeft + 'px;">';
							methods += cellValue.getMethods()[i];
							methods += '</div>';
						}

						// Is selected
						if (_this.graph.isCellSelected(cell) && _this.graph.getSelectionCount() == 1) {
							methods += addMethodButton;
						}
					} else {
						// Is selected
						if (_this.graph.isCellSelected(cell) && _this.graph.getSelectionCount() == 1) {
							methods += addMethodButton;
						} else {
							methods += '<div class="umlClassMethodsEmpty" style="height:' + _this.umlClassMethodsEmptyHeight + 'px;"></div>';
						}
					}

					methods += '</div>';

					// Result
					return '<div class="umlClass">'
						+ header + separator + fields + separator + methods
						+ '</div>';
				}
			} else {
				return '';
			}
		};


		// Properly set the div position for the cell
		const oldRedrawLabel = this.graph.cellRenderer.redrawLabel;

		this.graph.cellRenderer.redrawLabel = function (state) {
			// super
			oldRedrawLabel.apply(this, arguments);

			let graph = state.view.graph;
			let model = graph.model;

			if (model.isVertex(state.cell) && state.text != null) {

				state.text.node.style.overflow = 'hidden';
				state.text.node.style.top = (state.y + 1) + 'px';

				let div = state.text.node.getElementsByTagName('div')[0];

				if (div != null) {
					let scale = graph.view.scale;

					div.style.display = 'block';
					div.style.width = Math.max(1, Math.round(state.width / scale)) + 'px';
					div.style.height = Math.max(1, Math.round(state.height / scale)) + 'px';
				}
			}
		};
	}

	initializeEvents() {
		const _this = this;

		// Mouse wheel
		mxEvent.addMouseWheelListener(function (wheelevt) {
			// Check if the target is the uml editor
			let targetIsUmlEditor = false;

			let currentNode = wheelevt.target;
			while (currentNode != null) {
				if (currentNode.id == 'editor') {
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

		// Selection changed
		this.lastSelectedCells = [];

		this.graph.getSelectionModel().addListener(mxEvent.CHANGE, function (sender, evt) {
			var cells = sender.cells;

			if (_this.isConnectingEdge()) {
				return;
			}

			if (_this.lastSelectedCells != null) {
				// remove last overlays
				_this.hoverButtons.hide();

				// Update last selected cells
				for (let i = 0; i < _this.lastSelectedCells.length; i++) {
					_this.recalculateNodeSize(_this.lastSelectedCells[i]);
				}
			}

			// display overlay if one node selected
			if (cells != null && cells.length == 1) {
				let cell = cells[0];

				if (_this.isCellUmlClass(cell)) {
					_this.hoverButtons.show(cell);
					_this.updateHoverButtons(cell);
				}

				// Update
				_this.recalculateNodeSize(cell);
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

	getFreeNodePosition(cell) {
		const _this = this;

		// Bounds
		let width = this.umlClassDefaultWidth;
		let height = this.umlClassDefaultHeight;

		if (cell != null) {
			width = cell.getGeometry().width;
			height = cell.getGeometry().height;
		}

		// Does the area contain another node?
		const isAreaFree = function (x, y, width, height) {
			const umlClasses = _this.props.umlEditor.getUmlClassManager().getAll();

			for (let i = 0; i < umlClasses.length; i++) {
				const umlClass = umlClasses[i];

				// Return false if areas intersect
				const node = umlClass.getNode();

				if (node != null) {
					const x2 = node.getGeometry().x;
					const y2 = node.getGeometry().y;
					const width2 = node.getGeometry().width;
					const height2 = node.getGeometry().height;

					// Intersects?
					if (!(x > (x2 + width2)
							|| (x + width) < x2
							|| y > (y2 + height2)
							|| (y + height) < y2)) {
						return false;
					}

				}
			}

			return true;
		};

		// Find position
		let x = 0;
		let y = 0;
		let offsetX = this.umlClassDefaultWidth + 30;
		let offsetY = this.umlClassDefaultHeight + 30;

		while (true) {
			for (let i = 0; i < 10; i++) {
				if (isAreaFree(x, y, width, height)) {
					return [x, y];
				}

				x = x + offsetX;
			}

			x = 0;
			y = y + offsetY;
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

	startConnecting(edgeType) {
		let edge = this.graph.createEdge(null, null, null, null, null, edgeType);
		let edgeState = new mxCellState(this.graph.view, edge, this.graph.getCellStyle(edge));

		let cellState = this.graph.getView().getState(this.graph.getSelectionCell(), true);

		this.connectionHandler.start(cellState, 0, 0, edgeState);

		this.hoverButtons.hide();
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

	isCellUmlClass(cell) {
		return cell != null && cell.vertex == true && cell.parent == this.graph.getDefaultParent();
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

		let cell;
		try {
			// TODO use proper style
			// TODO what is actually necessary for the style?
			let style = 'fontSize=13;swimlane;html=1;fontStyle=1;strokeWidth=1;align=center;verticalAlign=top;childLayout=stackLayout;';
			cell = new mxCell(name, new mxGeometry(0, 0, this.umlClassDefaultWidth, 0), style);
			cell.vertex = true;

			const cellValue = new CellValue();
			cellValue.setName(name);

			cell.value = cellValue;
			this.graph.addCell(cell);

			this.recalculateNodeSize(cell);

		} finally {
			this.graph.getModel().endUpdate();
		}

		return cell;
	}

	removeNode(node) {
		this.graph.getModel().beginUpdate();

		try {
			// Remove from selection
			this.graph.getSelectionModel().removeCell(node);

			this.graph.getModel().remove(node);

			if (node != null) {
				node.removeFromParent();
			}

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
		const cellValue = node.value;

		cellValue.setName(name);

		this.recalculateNodeSize(node);
	}

	addClassField(node, fieldText) {
		const cellValue = node.value;

		cellValue.addField(fieldText);

		this.recalculateNodeSize(node);
	}

	removeClassField(node, fieldText) {
		const cellValue = node.value;

		cellValue.removeField(fieldText);

		this.recalculateNodeSize(node);
	}

	addClassMethod(node, methodText) {
		const cellValue = node.value;

		cellValue.addMethod(methodText);

		this.recalculateNodeSize(node);
	}

	removeClassMethod(node, methodText) {
		const cellValue = node.value;

		cellValue.removeMethod(methodText);

		this.recalculateNodeSize(node);
	}

	recalculateNodeSize(node) {
		const cellValue = node.value;
		const cellState = this.graph.getView().getState(node);

		// Stop if cellState doesnt exist
		if (cellState == null || (cellState != null && cellState.text == null)) {
			return;
		}

		const divBase = cellState.text.node.children[0];
		const divContainer = divBase.children[0];
		const divHeader = divContainer.children[0];
		const divFields = divContainer.children[2];
		const divMethods = divContainer.children[4];

		const canvas = document.createElement("canvas");
		const canvasContext = canvas.getContext("2d");

		const maxWidths = [];

		// Header width
		const headerStyle = window.getComputedStyle(divHeader);

		canvasContext.font = headerStyle.font;
		let headerWidth = canvasContext.measureText(cellValue.getName()).width;
		maxWidths.push(headerWidth);

		// Fields width
		if (cellValue.getFields() != null && cellValue.getFields().length > 0) {
			// Get the style from the first field (all fields have the same style)
			let fieldStyle = window.getComputedStyle(divFields.children[0]);
			canvasContext.font = fieldStyle.font;

			for (let i = 0; i < cellValue.getFields().length; i++) {
				let fieldWidth = canvasContext.measureText(cellValue.getFields()[i]).width;
				maxWidths.push(fieldWidth);
			}
		}

		// Methods width
		if (cellValue.getMethods() != null && cellValue.getMethods().length > 0) {
			// Get the style from the first method (all methods have the same style)
			let methodStyle = window.getComputedStyle(divMethods.children[0]);
			canvasContext.font = methodStyle.font;

			for (let i = 0; i < cellValue.getMethods().length; i++) {
				let methodWidth = canvasContext.measureText(cellValue.getMethods()[i]).width;
				maxWidths.push(methodWidth);
			}
		}

		// Use header left/right offset as general offset
		const offset = this.umlClassHeaderOffsetLeft + this.umlClassHeaderOffsetRight;

		// Find the maximum width
		let width = offset + Math.max(...maxWidths);

		// Width greater than absolute maximum?
		if (width > this.umlClassMaximumWidth) {
			width = this.umlClassMaximumWidth;
		}

		// Width smaller than minimum?
		if (width < this.umlClassMinimumWidth) {
			width = this.umlClassMinimumWidth;
		}


		// Calculate height
		let height = 0;

		// Header
		height += this.umlClassHeaderHeight;

		// Separator 1
		height += this.umlClassSeparatorHeight;

		// Fields
		height += this.umlClassFieldsOffsetTop;
		height += this.umlClassFieldsOffsetBottom;

		if (cellValue.getFields() != null && cellValue.getFields().length > 0) {
			height += this.umlClassFieldHeight * cellValue.getFields().length;

			// Is selected
			if (this.graph.isCellSelected(node) && this.graph.getSelectionCount() == 1) {
				height += this.umlClassAddClassFieldHeight;
			}
		} else {
			// Is selected
			if (this.graph.isCellSelected(node) && this.graph.getSelectionCount() == 1) {
				height += this.umlClassAddClassFieldHeight;
			} else {
				height += this.umlClassFieldsEmptyHeight;
			}
		}

		// Separator 2
		height += this.umlClassSeparatorHeight;

		// Methods
		height += this.umlClassMethodsOffsetTop;
		height += this.umlClassMethodsOffsetBottom;

		if (cellValue.getMethods() != null && cellValue.getMethods().length > 0) {
			height += this.umlClassMethodHeight * cellValue.getMethods().length;

			// Is selected
			if (this.graph.isCellSelected(node) && this.graph.getSelectionCount() == 1) {
				height += this.umlClassAddClassMethodHeight;
			}
		} else {
			// Is selected
			if (this.graph.isCellSelected(node) && this.graph.getSelectionCount() == 1) {
				height += this.umlClassAddClassMethodHeight;
			} else {
				height += this.umlClassMethodsEmptyHeight;
			}
		}

		// Node
		const oldGeo = node.getGeometry();
		node.setGeometry(new mxGeometry(oldGeo.x, oldGeo.y, width, height));

		this.graph.refresh(node);

		// Update Edges
		let edgeCount = this.graph.getModel().getEdgeCount(node);

		for (let i = 0; i < edgeCount; i++) {
			let edge = this.graph.getModel().getEdgeAt(node, i);

			this.graph.view.invalidate(edge, true, false);
			this.graph.view.validate(edge);
		}
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

	render() {
		const _this = this;

		// mxGraph requires an element that is not a styled-component
		return (
			<StyledGraphView>
                <div ref={(umlGraphContainer) => {_this.umlGraphContainer = umlGraphContainer}} style={{ height: '100%' }}></div>
                <HoverButtons ref={(hoverButtons) => {_this.hoverButtons = hoverButtons}} umlEditor={_this.props.umlEditor} toggleCodingView={this.props.toggleCodingView}></HoverButtons>
            </StyledGraphView>
		);
	}
}