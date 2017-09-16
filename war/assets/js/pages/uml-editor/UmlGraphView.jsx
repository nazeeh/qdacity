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

		this.umlClassDefaultWidth = 160;
		this.umlClassDefaultHeight = 59;
		this.umlClassHeaderHeight = 25;
		this.umlClassSeparatorHeight = 1;
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
		this.layout.forceConstantSquared = 200 * 200;
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
					return '<table style="overflow:hidden;" width="100%" height="100%" border="1" cellpadding="4" class="title" style="height:100%;">'
						+ '<tr><th>Customers</th></tr>'
						+ '</table>';
				} else {
					const cellValue = cell.value;

					// Header
					let header = '<div '
						+ 'style="width:100%; height:' + _this.umlClassHeaderHeight + 'px; line-height:' + _this.umlClassHeaderHeight + 'px;"'
						+ '>' + cellValue.getName() + '</div>';

					// Separator
					let separator = '<div style="width:100%; height:' + _this.umlClassSeparatorHeight + 'px; background-color:black;"></div>';

					// Fields
					let fields = '<div style="width:100%; padding-top:' + _this.umlClassFieldsOffsetTop + 'px; padding-bottom:' + _this.umlClassFieldsOffsetBottom + 'px;">';

					if (cellValue.getFields() != null && cellValue.getFields().length > 0) {
						for (let i = 0; i < cellValue.getFields().length; i++) {
							fields += '<div style="width:100%; height:' + _this.umlClassFieldHeight + 'px; line-height:' + _this.umlClassFieldHeight + 'px; padding-left:' + _this.umlClassFieldOffsetLeft + 'px; padding-right:' + _this.umlClassFieldOffsetRight + 'px;">';
						}
					} else {
						fields += '<div style="width:100%; height:' + _this.umlClassFieldsEmptyHeight + 'px;"></div>';
					}

					fields += '</div>';

					// Methods
					let methods = '<div style="width:100%; padding-top:' + _this.umlClassMethodsOffsetTop + 'px; padding-bottom:' + _this.umlClassMethodsOffsetBottom + 'px;">';

					if (cellValue.getMethods() != null && cellValue.getMethods().length > 0) {
						for (let i = 0; i < cellValue.getMethods().length; i++) {
							methods += '<div style="width:100%; height:' + _this.umlClassMethodHeight + 'px; line-height:' + _this.umlClassMethodHeight + 'px; padding-left:' + _this.umlClassMethodOffsetLeft + 'px; padding-right:' + _this.umlClassMethodOffsetRight + 'px;">';
						}
					} else {
						methods += '<div style="width:100%; height:' + _this.umlClassMethodsEmptyHeight + 'px;"></div>';
					}

					methods += '</div>';

					// Result
					return '<div style="width:100%; height:100%; cursor:move !important;">'
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

					// TODO is the following necessary!?

					// Installs the handler for updating connected edges
					if (div.scrollHandler == null) {
						div.scrollHandler = true;

						var updateEdges = mxUtils.bind(this, function () {
							var edgeCount = model.getEdgeCount(state.cell);

							// Only updates edges to avoid update in DOM order
							// for text label which would reset the scrollbar
							for (var i = 0; i < edgeCount; i++) {
								var edge = model.getEdgeAt(state.cell, i);
								graph.view.invalidate(edge, true, false);
								graph.view.validate(edge);
							}
						});

						mxEvent.addListener(div, 'scroll', updateEdges);
						mxEvent.addListener(div, 'mouseup', updateEdges);
					}
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
				_this.hoverButtons.hide();
			}

			// display overlay if one node selected
			if (cells != null && cells.length == 1) {
				let cell = cells[0];

				if (_this.isCellUmlClass(cell)) {
					_this.hoverButtons.show(cell);
					_this.updateHoverButtons(cell);
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
		node.setValue(name);
		this.graph.refresh(node);
	}

	addClassField(node, fieldText) {
		const cellValue = node.value;

		cellValue.addField(fieldText);

		this.recalculateNodeSize(node);
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

	addClassMethod(node, methodText) {
		const cellValue = node.value;

		cellValue.addMethod(methodText);

		this.recalculateNodeSize(node);
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
		const cellValue = node.value;

		let width = oldGeo.width;
		let currentHeight = 0;

		// Header
		currentHeight += this.umlClassHeaderHeight;

		// Separator 1
		currentHeight += this.umlClassSeparatorHeight;

		// Fields
		currentHeight += this.umlClassFieldsOffsetTop;
		currentHeight += this.umlClassFieldsOffsetBottom;

		if (cellValue.getFields() != null && cellValue.getFields().length > 0) {
			currentHeight += this.umlClassFieldHeight * cellValue.getFields().length;
		} else {
			currentHeight += this.umlClassFieldsEmptyHeight;
		}

		// Separator 2
		currentHeight += this.umlClassSeparatorHeight;

		// Methods
		currentHeight += this.umlClassMethodsOffsetTop;
		currentHeight += this.umlClassMethodsOffsetBottom;

		if (cellValue.getMethods() != null && cellValue.getMethods().length > 0) {
			currentHeight += this.umlClassMethodHeight * cellValue.getMethods().length;
		} else {
			currentHeight += this.umlClassMethodsEmptyHeight;
		}

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
                <HoverButtons ref={(hoverButtons) => {_this.hoverButtons = hoverButtons}} umlEditor={_this.props.umlEditor} toggleCodingView={this.props.toggleCodingView}></HoverButtons>
            </StyledGraphView>
		);
	}
}