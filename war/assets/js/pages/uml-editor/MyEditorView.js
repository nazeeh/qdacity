import {
	EdgeType
} from './EdgeType.js';

export default class MyEditorView {

	constructor(container) {
		this.graph = null;
		this.layout = null;

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

		// Initializes the styles
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

		// None
		style = {};
		style[mxConstants.STYLE_STARTARROW] = 'none';
		style[mxConstants.STYLE_ENDARROW] = 'none';
		stylesheet.putCellStyle(EdgeType.NONE, style);

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

	addNode(name) {
		var parent = this.graph.getDefaultParent();

		this.graph.getModel().beginUpdate();

		var node;
		try {
			node = this.addClass(name); //this.graph.insertVertex(parent, null, name, 20, 20, 80, 30);
		} finally {
			this.graph.getModel().endUpdate();
		}

		return node;
	}

	addEdge(v1, v2, edgeType) {
		var parent = this.graph.getDefaultParent();

		this.graph.getModel().beginUpdate();

		var edge;
		try {
			edge = this.graph.insertEdge(parent, null, '', v1, v2, edgeType);

		} finally {
			this.graph.getModel().endUpdate();
		}

		return edge;
	}

	applyLayout() {
		var parent = this.graph.getDefaultParent();

		this.graph.getModel().beginUpdate();

		try {
			this.layout.execute(parent);
		} finally {
			this.graph.getModel().endUpdate();
			alert('done');
		}
	}

	addClass(name) {
		//		var fieldstyle = 'movable=0;text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;whiteSpace=wrap;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;';
		//	    var field = new mxCell('+ field: type', new mxGeometry(0, 30, 160, 22), fieldstyle);
		//	    field.vertex = true;
		//	    
		//	    var method = new mxCell('+ method(type): type', new mxGeometry(0, 62, 160, 26), fieldstyle);
		//	    method.vertex = true;
		//	    
		//	    var divider = new mxCell('', new mxGeometry(0, 26, 160, 32), 'movable=0;line;html=1;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=3;spacingRight=3;rotatable=0;labelPosition=right;points=[];portConstraint=eastwest;');
		//	    divider.vertex = true;



		//	    var simplefieldstyle = 'movable=0;text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;whiteSpace=wrap;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;';
		//	    
		//	    var simplefield = new mxCell('+ field: type', new mxGeometry(0, 0, 160, 22), fieldstyle);
		//	    simplefield.vertex = true;
		//	    
		//	    var simplemethod = new mxCell('+ method(type): type', new mxGeometry(0, 0, 160, 26), fieldstyle);
		//	    simplemethod.vertex = true;


		let fields = new mxCell('', new mxGeometry(0, 0, 0, 0), 'foldable=0;movable=0;line;html=1;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=3;spacingRight=3;rotatable=0;labelPosition=right;points=[];portConstraint=eastwest;');
		fields.vertex = true;

		let methods = new mxCell('', new mxGeometry(0, 0, 0, 0), 'foldable=0;movable=0;html=1;strokeColor=none;strokeWidth=0;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=3;spacingRight=3;rotatable=0;labelPosition=right;points=[];portConstraint=eastwest;');
		methods.vertex = true;



		let style = 'fontSize=13;swimlane;html=1;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;';
		let cell = new mxCell(name, new mxGeometry(0, 0, 160, 0), style);
		cell.vertex = true;
		cell.insert(fields);
		cell.insert(methods);
		//cell.insert(divider.clone());
		//cell.insert(field.clone());
		//cell.insert(method.clone());

		this.graph.addCell(cell);

		this.recalculateVertexSize(cell);

		return cell;

		//return createVertexTemplateFromCells([cell], cell.geometry.width, cell.geometry.height, 'Class');
	}

	addClassField(vertex, text) {
		const simplefieldstyle = 'foldable=0;movable=0;text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;whiteSpace=wrap;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;';

		let simplefield = new mxCell(text, new mxGeometry(0, 0, 160, 15), simplefieldstyle);
		simplefield.vertex = true;

		let fields = vertex.children[0];
		fields.insert(simplefield);

		this.recalculateVertexSize(vertex);
	}

	addClassMethod(vertex, text) {
		const simplefieldstyle = 'foldable=0;movable=0;text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;whiteSpace=wrap;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;';

		let simplemethod = new mxCell(text, new mxGeometry(0, 0, 160, 15), simplefieldstyle);
		simplemethod.vertex = true;

		let methods = vertex.children[1];
		methods.insert(simplemethod);

		this.recalculateVertexSize(vertex);
	}

	recalculateVertexSize(vertex) {
		let fields = vertex.children[0];
		let fieldsHeight = 5 + 5 + 15 * fields.getChildCount();


		let methods = vertex.children[1];
		let methodsHeight = 5 + 5 + 15 * methods.getChildCount();


		let oldGeo = vertex.getGeometry();
		let width = oldGeo.width;
		vertex.setGeometry(new mxGeometry(oldGeo.x, oldGeo.y, width, 30 + fieldsHeight + methodsHeight));

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


	createVertexTemplateFromCells(cells, width, height, title, showLabel, showTitle, allowCellsInserted) {
		return this.createItem(cells, title, showLabel, showTitle, width, height, allowCellsInserted);
	};

	createItem(cells, title, showLabel, showTitle, width, height, allowCellsInserted) {

		var border = (mxClient.IS_QUIRKS) ? 8 + 2 * this.thumbPadding : 2 * this.thumbBorder;

		if (mxClient.IS_IE6) {
			elt.style.border = 'none';
		}

		// Blocks default click action
		mxEvent.addListener(elt, 'click', function (evt) {
			mxEvent.consume(evt);
		});
		var bounds = new mxRectangle(0, 0, width, height);

		if (cells.length > 1 || cells[0].vertex) {
			var ds = this.createDragSource(elt, this.createDropHandler(cells, true, allowCellsInserted,
				bounds), this.createDragPreview(width, height), cells, bounds);
			this.addClickHandler(elt, ds, cells);

			// Uses guides for vertices only if enabled in graph
			ds.isGuidesEnabled = mxUtils.bind(this, function () {
				return this.editorUi.editor.graph.graphHandler.guidesEnabled;
			});
		} else if (cells[0] != null && cells[0].edge) {
			var ds = this.createDragSource(elt, this.createDropHandler(cells, false, allowCellsInserted,
				bounds), this.createDragPreview(width, height), cells, bounds);
			this.addClickHandler(elt, ds, cells);
		}

		// Shows a tooltip with the rendered cell
		if (!mxClient.IS_IOS) {
			mxEvent.addGestureListeners(elt, null, mxUtils.bind(this, function (evt) {
				if (mxEvent.isMouseEvent(evt)) {
					this.showTooltip(elt, cells, bounds.width, bounds.height, title, showLabel);
				}
			}));
		}

		return elt;
	};


}