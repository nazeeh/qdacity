import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

import Cell from './Cell.jsx';
import CellValue from './CellValue.js';
import EdgeValue from './EdgeValue.js';

import {
	EdgeType
} from './EdgeType.js';

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

		this.autoLayoutOffsetTop = 50;
		this.autoLayoutOffsetLeft = 60;
		this.autoLayoutOffsetNextX = 50;
		this.autoLayoutOffsetNextY = 30;

		this.umlClassDefaultWidth = 162;
		this.umlClassDefaultHeight = 75; // TODO fix => neu berechnen oder dynamisch belegen (header + fields + methods + 2x sep)


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


		// Enables the rendering of cells with html labels. The label/header size is increased to fit the entire cell.
		// Then, instead of rendering simple text, this option allows to render html content for the cell.
		mxGraphHandler.prototype.htmlPreview = true;

		// Disables foreign-objects. This options is required for using custom html inside cells.
		mxClient.NO_FO = true;


		// Enables rubberband selection
		new mxRubberband(this.graph);

		new mxGraphHandler(this.graph);

		this.initializeStyles();

		this.initializeLayouting();

		this.initializeConnections();

		this.initializePanning();

		this.initializeNodeRendering();

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
			const edgeValue = new EdgeValue(-1);

			const edge = new mxCell(edgeValue, new mxGeometry());
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

			const sourceCode = _this.props.umlEditor.getCodeById(sourceNode.value.getCodeId());
			const destinationCode = _this.props.umlEditor.getCodeById(destinationNode.value.getCodeId());

			_this.props.umlEditor.createEdge(sourceCode, destinationCode, edgeType);

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
				// Return something not empty to render the react component
				return '<div></div>';
			} else {
				return '';
			}
		};


		// Properly set the div position for the cell. This div will be used to display the cell cotent.
		// Add event listeners to cell components
		const oldRedrawLabel = this.graph.cellRenderer.redrawLabel;

		this.graph.cellRenderer.redrawLabel = function (state) {
			// super
			oldRedrawLabel.apply(this, arguments);

			const cell = state.cell;

			if (_this.graph.getModel().isVertex(cell) && state.text != null) {
				const divBase = state.text.node.children[0];

				// Render the react component 
				// unmount happens in recalculateNodeSize()
				_this.codesystemView = ReactDOM.render(_this.getCellContent(cell), divBase);

				// Set size of the main div
				state.text.node.style.overflow = 'hidden';
				state.text.node.style.top = (state.y + 1) + 'px';

				let div = state.text.node.getElementsByTagName('div')[0];

				if (div != null) {
					let scale = _this.graph.getView().scale;

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

	initializeClassSizeCalculator() {
		const container = document.createElement('div');
		container.id = 'classSizeCalculatorContainer';
		container.style.visibility = "hidden";
		container.style.position = "absolute";
		document.body.appendChild(container);

		return container;
	}

	calculateClassSize(content) {
		let container = document.getElementById('classSizeCalculatorContainer');

		if (container == null) {
			container = this.initializeClassSizeCalculator();
		}

		ReactDOM.render(content, container);

		let width = container.clientWidth + 2;
		let height = container.clientHeight + 1;

		ReactDOM.unmountComponentAtNode(container);

		return [width, height];
	}

	getCellContent(cell) {
		const cellValue = cell.value;
		const collapsed = this.graph.isCellCollapsed(cell);
		const selected = this.graph.isCellSelected(cell) && this.graph.getSelectionCount() == 1;

		return (
			<Cell umlEditor={this.props.umlEditor} cell={cell} cellValue={cellValue} collapsed={collapsed} selected={selected} />
		);
	}

	getNodeByCodeId(id) {
		const allNodes = this.graph.getModel().getChildren(this.graph.getDefaultParent());

		if (allNodes != null) {
			for (let i = 0; i < allNodes.length; i++) {
				if (allNodes[i].vertex) {
					if (allNodes[i].value.getCodeId() == id) {
						return allNodes[i];
					}
				}
			}
		}
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
		const allNodes = _this.graph.getModel().getChildren(_this.graph.getDefaultParent());

		const isAreaFree = function (x, y, width, height) {
			if (allNodes != null) {
				for (let i = 0; i < allNodes.length; i++) {
					let node = allNodes[i];

					// Node will intersect with itself
					if (node.mxObjectId != cell.mxObjectId && node.vertex) {
						// Return false if areas intersect
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
			}

			return true;
		};

		// Find position
		let x = this.autoLayoutOffsetLeft;
		let y = this.autoLayoutOffsetTop;
		let offsetX = this.umlClassDefaultWidth + this.autoLayoutOffsetNextX;
		let offsetY = this.umlClassDefaultHeight + this.autoLayoutOffsetNextY;

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

		return [x, y];
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

	toggleCollapseCell(cell) {
		cell.setCollapsed(!cell.isCollapsed());
		this.recalculateNodeSize(cell);
	}

	expandCell(cell) {
		cell.setCollapsed(false);
		this.recalculateNodeSize(cell);
	}

	expandAll() {
		const _this = this;

		this.graph.model.getChildren(this.graph.getDefaultParent()).forEach((cell) => {
			if (cell.vertex) _this.expandCell(cell);
		});
	}

	collapseAll() {
		const _this = this;

		this.graph.model.getChildren(this.graph.getDefaultParent()).forEach((cell) => {
			if (cell.vertex) _this.collapseCell(cell);
		});
	}

	collapseCell(cell) {
		cell.setCollapsed(true);
		this.recalculateNodeSize(cell);
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

	addEdge(nodeFrom, nodeTo, relationId, edgeType) {
		let parent = this.graph.getDefaultParent();

		const edgeValue = new EdgeValue(relationId);

		// Does the edge already exist? Happens when manually connecting a new edge (with the connection handler)
		const outgoingEdges = this.graph.getModel().getOutgoingEdges(nodeFrom);

		for (let i = 0; i < outgoingEdges.length; i++) {
			let outgoingEdge = outgoingEdges[i];

			if (outgoingEdge.value.getRelationId() == -1 && outgoingEdge.style == edgeType) {
				outgoingEdge.value = edgeValue;
				return;
			}
		}

		// Insert edge
		this.graph.getModel().beginUpdate();

		let edge;
		try {
			edge = this.graph.insertEdge(parent, null, edgeValue, nodeFrom, nodeTo, edgeType);
		} finally {
			this.graph.getModel().endUpdate();
		}

		return edge;
	}

	removeEdge(node, relationId) {
		// Find edge
		let edge = null;

		const edges = this.graph.getModel().getOutgoingEdges(node);

		for (let i = 0; i < edges.length; i++) {
			if (edges[i].value.getRelationId() == relationId) {
				edge = node.edges[i];
				break;
			}
		}

		// Delete edge
		this.graph.getModel().beginUpdate();

		try {
			edge.removeFromParent();

			this.graph.refresh(edge);

		} finally {
			this.graph.getModel().endUpdate();
		}
	}

	addNode(codeId, name) {
		let parent = this.graph.getDefaultParent();

		this.graph.getModel().beginUpdate();

		let cell;
		try {
			const cellValue = new CellValue();
			cellValue.setCodeId(codeId);
			cellValue.setHeader(name);

			// TODO use proper style
			// TODO what is actually necessary for the style?
			let style = 'fontSize=13;swimlane;html=1;fontStyle=1;strokeWidth=1;align=center;verticalAlign=top;childLayout=stackLayout;';
			cell = new mxCell(cellValue, new mxGeometry(0, 0, this.umlClassDefaultWidth, 0), style);
			cell.vertex = true;

			this.graph.addCell(cell);

		} finally {
			this.graph.getModel().endUpdate();
		}

		this.recalculateNodeSize(cell);

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

		cellValue.setHeader(name);

		this.recalculateNodeSize(node);
	}

	addClassField(node, relationId, accessibility, text) {
		const cellValue = node.value;

		cellValue.addField(relationId, accessibility, text);

		this.recalculateNodeSize(node);
	}

	removeClassField(node, relationId) {
		const cellValue = node.value;

		cellValue.removeField(relationId);

		this.recalculateNodeSize(node);
	}

	addClassMethod(node, relationId, accessibility, text) {
		const cellValue = node.value;

		cellValue.addMethod(relationId, accessibility, text);

		this.recalculateNodeSize(node);
	}

	removeClassMethod(node, relationId) {
		const cellValue = node.value;

		cellValue.removeMethod(relationId);

		this.recalculateNodeSize(node);
	}

	recalculateNodeSize(node) {
		const _this = this;

		const cellValue = node.value;
		const cellState = this.graph.getView().getState(node);

		// Stop if cellState doesnt exist
		if (cellState == null || (cellState != null && cellState.text == null)) {
			return;
		}

		// Unmount cell
		const divBase = cellState.text.node.children[0];
		ReactDOM.unmountComponentAtNode(divBase);

		// Get width / height
		let [width, height] = this.calculateClassSize(this.getCellContent(node));

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

		// Update hover buttons
		this.updateHoverButtons(node);
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