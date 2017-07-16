import React from 'react';
import styled from 'styled-components';

import {
	EdgeType
} from './EdgeType.js';
import UmlClass from './model/UmlClass.js';
import UmlClassRelation from './model/UmlClassRelation.js';
import UmlCodeMetaModelModal from '../../common/modals/UmlCodeMetaModelModal';
import UmlCodePropertyModal from '../../common/modals/UmlCodePropertyModal';

import CodesEndpoint from '../../common/endpoints/CodesEndpoint';
import UmlCodePositionEndpoint from '../../common/endpoints/UmlCodePositionEndpoint';

const StyledGraphView = styled.div `
    overflow: hidden;
    cursor: default
`;

export default class UmlGraphView extends React.Component {

	constructor(props) {
		super(props);

		this.umlEditor = this.props.umlEditor;

		this.graph = null;
		this.cellMarker = null;
		this.connectionHandler = null;
		this.layout = null;
	}

	componentDidMount() {
		this.initialize();
	}

	initialize() {
		const container = this.refs.umlGraphContainer;

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

	initializeLayouting() {
		// Enables layouting
		this.layout = new mxFastOrganicLayout(this.graph);
		this.layout.disableEdgeStyle = false;
		this.layout.forceConstant = 180;
		this.layout.forceConstantSquared = 180 * 180;
	}

	initializeConnections() {
		const _this = this;

		// Cell Marker
		this.cellMarker = new mxCellMarker(this.graph);

		this.graph.addMouseListener({
			mouseDown: function (sender, me) {},
			mouseMove: function (sender, me) {},
			mouseUp: function (sender, me) {
				me.consumed = false;
				_this.cellMarker.process(me);
			}
		});

		// Connection Handler
		this.connectionHandler = new mxConnectionHandler(this.graph, function (source, target, style) {
			const edge = new mxCell('', new mxGeometry());
			edge.setEdge(true);
			edge.setStyle(style);
			edge.geometry.relative = true;
			return edge;
		});
		this.connectionHandler.livePreview = true;

		this.connectionHandler.isValidTarget = function (cell) {
			return _this.cellIsUmlClass(cell);
		};

		this.connectionHandler.getEdgeWidth = function (valid) {
			return (valid) ? 1 : 1;
		};

		this.connectionHandler.addListener(mxEvent.CONNECT, function (sender, evt) {
			const edgeType = evt.properties.cell.style;
			const sourceNode = evt.properties.cell.source;
			const destinationNode = evt.properties.cell.target;

			const sourceUmlClass = _this.getUmlClassByNode(sourceNode);
			const destinationUmlClass = _this.getUmlClassByNode(destinationNode);

			_this.metaModelMapper.addedEdge(evt.cell, edgeType, sourceUmlClass, destinationUmlClass);
		});
	}

	initializeEvents() {
		const _this = this;

		let lastSelectedCells = [];

		this.graph.getSelectionModel().addListener(mxEvent.CHANGE, function (sender, evt) {
			var cells = sender.cells;

			// remove last overlays
			if (lastSelectedCells != null) {
				lastSelectedCells.forEach((cell) => {
					_this.graph.removeCellOverlays(cell);
				});
			}

			// display overlay if one node selected
			if (cells != null && cells.length == 1) {
				let cell = cells[0];

				let sourceUmlClass = _this.getUmlClassByNode(cell);

				if (_this.cellIsUmlClass(cell)) {
					let overlays = _this.graph.getCellOverlays(cell);

					if (overlays == null) {
						// Overlay MetaModel
						var overlayMetaModel = new mxCellOverlay(new mxImage('assets/img/overlayButtonMetaModel.png', 34, 30), 'Edit MetaModel', mxConstants.ALIGN_LEFT, mxConstants.ALIGN_TOP, new mxPoint(17, -22));
						overlayMetaModel.cursor = 'pointer';

						overlayMetaModel.addListener(mxEvent.CLICK, function (sender, evt2) {
							let umlClass = _this.getUmlClassByNode(cell);
							let code = umlClass.getCode();

							let codeMetaModelModal = new UmlCodeMetaModelModal(code);

							codeMetaModelModal.showModal(_this.mmEntities, _this.mmRelations).then(function (data) {
								// TODO duplicate code in UnmappedCodeElement.jsx
								console.log('Closed modal');

								if (code.mmElementIDs != data.ids) {
									console.log('New mmElementIds for code ' + code.name + ' (' + code.codeID + '): ' + data.ids + '. Old Ids: ' + data.oldIds);

									code.mmElementIDs = data.ids;

									console.log('Updating the mmElementIds for code ' + code.name + ' (' + code.codeID + ') in the database...');

									CodesEndpoint.updateCode(code).then(function (resp) {
										console.log('Updated the mmElementIds for code ' + code.name + ' (' + code.codeID + ') in the database.');
										_this.exchangeCodeMetaModelEntities(resp.codeID, data.oldIds);
									});
								}
							});
						});

						_this.graph.addCellOverlay(cell, overlayMetaModel);

						// Overlay AddField
						var overlayAddField = new mxCellOverlay(new mxImage('assets/img/overlayButtonAddField.png', 31, 30), 'Add new field', mxConstants.ALIGN_RIGHT, mxConstants.ALIGN_TOP, new mxPoint(-54, -22));
						overlayAddField.cursor = 'pointer';

						overlayAddField.addListener(mxEvent.CLICK, function (sender, evt2) {
							let addFieldModal = new UmlCodePropertyModal('Add new Field', _this.codesystem);

							addFieldModal.showModal().then(function (data) {
								console.log('Closed modal');

								const destinationUmlClass = _this.getUmlClassByCode(data.selectedCode);
								const destinationCode = destinationUmlClass.getCode();

								// Validate
								// TODO handle this in another way
								if (!_this.metaModelMapper.codeHasMetaModelEntity(destinationCode, 'Object')
									&& !_this.metaModelMapper.codeHasMetaModelEntity(destinationCode, 'Actor')
									&& !_this.metaModelMapper.codeHasMetaModelEntity(destinationCode, 'Place')) {
									alert('ERROR: Cant add a field if the destination code is not an Object/Actor/Place.');
									return;
								}

								const fieldNode = _this.addClassField(sourceUmlClass.getNode(), '+ ' + destinationUmlClass.getCode().name + ': type');

								_this.metaModelMapper.addedField(fieldNode, sourceUmlClass, destinationUmlClass);
							});
						});

						_this.graph.addCellOverlay(cell, overlayAddField);

						// Overlay AddMethod
						var overlayAddMethod = new mxCellOverlay(new mxImage('assets/img/overlayButtonAddMethod.png', 31, 30), 'Add new method', mxConstants.ALIGN_RIGHT, mxConstants.ALIGN_TOP, new mxPoint(-15, -22));
						overlayAddMethod.cursor = 'pointer';

						overlayAddMethod.addListener(mxEvent.CLICK, function (sender, evt2) {
							let addMethodModal = new UmlCodePropertyModal('Add new Method', _this.codesystem);

							addMethodModal.showModal().then(function (data) {
								console.log('Closed modal');

								let destinationUmlClass = _this.getUmlClassByCode(data.selectedCode);

								// Validate
								// TODO handle this in another way
								if (_this.metaModelMapper.isCodeValidNode(destinationUmlClass.getCode())) {
									alert('ERROR: Cant add a method if the destination code is an uml class.');
									return;
								}

								const methodNode = _this.addClassMethod(sourceUmlClass.getNode(), '+ ' + destinationUmlClass.getCode().name + '(type): type');

								_this.metaModelMapper.addedMethod(methodNode, sourceUmlClass, destinationUmlClass);
							});
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

			lastSelectedCells = cells.slice(); // use a copy
		});
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
					let umlClass = _this.getUmlClassByNode(cell);
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

		this.graph.refresh(node);
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

	render() {
		// mxGraph requires an element that is not a styled-component            
		return (
			<StyledGraphView>
                <div ref="umlGraphContainer"></div>
            </StyledGraphView>
		);
	}
}