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
				const cellValue = cell.value;

				// Container
				let container = '<div class="umlClass">';
				let containerEnd = '</div>';

				// Header
				let header = '<div class="umlClassHeader">' + cellValue.getHeader() + '</div>';

				if (_this.graph.isCellCollapsed(cell)) {
					// Result
					return container + header + containerEnd;
				} else {
					// Separator
					let separator = '<div class="umlClassSeparator"></div>';

					// Fields / Methods
					const createElements = (typeName, elements) => {
						let content = '<div class="umlClassElements">';

						let addElementLink = '<div class="umlClassAddElementLinkContainer">';
						addElementLink += '<a class="umlClassAddElementLink">+ Add ' + typeName + '</a>';
						addElementLink += '</div>';

						if (elements != null && elements.length > 0) {
							for (let i = 0; i < elements.length; i++) {
								content += '<div class="umlClassElement">';

								content += '<div class="umlClassElementAccessibility">';
								content += elements[i].getAccessibility();
								content += '</div>';

								content += '<div class="umlClassElementText">';
								content += elements[i].getText();
								content += '</div>';

								// Is selected => show delete button
								if (_this.graph.isCellSelected(cell) && _this.graph.getSelectionCount() == 1) {
									content += '<div class="umlClassRemoveElementButton">';
									content += '<i class="fa fa-trash fa-1x"></i>';
									content += '</div>';
								}

								content += '</div>';
							}

							// Is selected
							if (_this.graph.isCellSelected(cell) && _this.graph.getSelectionCount() == 1) {
								content += addElementLink;
							}

						} else {
							// Is selected
							if (_this.graph.isCellSelected(cell) && _this.graph.getSelectionCount() == 1) {
								content += addElementLink;
							} else {
								content += '<div class="umlClassElementsEmpty"></div>';
							}
						}

						content += '</div>';

						return content;
					};

					let fields = createElements('Field', cellValue.getFields());
					let methods = createElements('Method', cellValue.getMethods());

					// Result
					return container + header + separator + fields + separator + methods + containerEnd;
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
			let cell = state.cell;

			if (model.isVertex(cell) && state.text != null) {
				const cellValue = cell.value;

				// Event listener
				if (!_this.graph.isCellCollapsed(cell)) {
					// Register onClick listener for add field/method link
					const divBase = state.text.node.children[0];
					const divContainer = divBase.children[0];
					const divFields = divContainer.children[2];
					const divMethods = divContainer.children[4];

					// Add Field/Method + Delete Element onClick listener
					const addOnClickListener = (divContainer, elements, addListener, removeListener) => {
						if (divContainer.children != null && divContainer.children.length > 0) {
							// Add
							let lastChild = divContainer.children[divContainer.children.length - 1];

							if (lastChild.children != null && lastChild.children.length == 1 && lastChild.children[0].nodeName == 'A') {
								let link = lastChild.children[0];
								link.onclick = addListener;
							}

							// Remove
							for (let i = 0; i < divContainer.children.length; i++) {
								let child = divContainer.children[i];

								// Is not add field?
								if (child.children != null && child.children.length == 2
									&& child.children[0].nodeName == 'DIV'
									&& child.children[1].nodeName == 'DIV') {
									let deleteButton = child.children[1];
									let relationId = elements[i].getRelationId();

									deleteButton.onclick = () => removeListener(relationId);
								}
							}
						}
					};

					addOnClickListener(divFields, cellValue.getFields(), () => _this.props.umlEditor.openClassFieldModal(state.cell), (relationId) => _this.props.umlEditor.deleteClassField(state.cell, relationId));
					addOnClickListener(divMethods, cellValue.getMethods(), () => _this.props.umlEditor.openClassMethodModal(state.cell), (relationId) => _this.props.umlEditor.deleteClassMethod(state.cell, relationId));
				}

				// Set size
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

    initializeClassSizeCalculator() {
        const container = document.createElement('div');
        container.id = 'classSizeCalculatorContainer';
        container.style.visibility = "hidden";
        container.style.position = "absolute";
        document.body.appendChild(container);

        return container;
    }

    calculateClassSize(innerHTML) {
        let container = document.getElementById('classSizeCalculatorContainer');

        if (container == null) {
            container = this.initializeClassSizeCalculator();
        }

        container.style.visibility = "visible";

        container.innerHTML = innerHTML;

        container.style.visibility = "hidden";

        return [container.clientWidth + 2, container.clientHeight + 1];
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

	expandAll() {
		const _this = this;

		this.graph.model.getChildren(this.graph.getDefaultParent()).forEach((cell) => {
			cell.setCollapsed(false);
			_this.recalculateNodeSize(cell);
		});
	}

	collapseAll() {
		const _this = this;

		this.graph.model.getChildren(this.graph.getDefaultParent()).forEach((cell) => {
			cell.setCollapsed(true);
			_this.recalculateNodeSize(cell);
		});
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
			cellValue.setHeader(name);

			cell.value = cellValue;
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

		// Get width / height
		let [width, height] = this.calculateClassSize(this.graph.getLabel(node));

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