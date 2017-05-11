
export default class MyEditorView {
    
	constructor(container, edgeTypes) {	
        this.edgeTypes = edgeTypes;
        
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
        stylesheet.putCellStyle(this.edgeTypes.NONE, style);
        
        // Generalization
        style = {};
        style[mxConstants.STYLE_STARTARROW] = 'none';
        style[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_BLOCK;
        style[mxConstants.STYLE_ENDFILL] = 0;
        stylesheet.putCellStyle(this.edgeTypes.GENERALIZATION, style);

        // Dependency
        style = {};
        style[mxConstants.STYLE_STARTARROW] = 'none';
        style[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_OPEN;
        style[mxConstants.STYLE_DASHED] = 1;
        stylesheet.putCellStyle(this.edgeTypes.DEPENDENCY, style);

        // Aggregation
        style = {};
        style[mxConstants.STYLE_STARTARROW] = mxConstants.ARROW_DIAMOND_THIN;
        style[mxConstants.STYLE_ENDARROW] = 'none';
        style[mxConstants.STYLE_STARTFILL] = 0;
        style[mxConstants.STYLE_STARTSIZE] = 20;
        stylesheet.putCellStyle(this.edgeTypes.AGGREGATION, style);

        // Containment
        style = {};
        style[mxConstants.STYLE_STARTARROW] = mxConstants.ARROW_DIAMOND_THIN;
        style[mxConstants.STYLE_ENDARROW] = 'none';
        style[mxConstants.STYLE_STARTFILL] = 1;
        style[mxConstants.STYLE_STARTSIZE] = 20;
        stylesheet.putCellStyle(this.edgeTypes.CONTAINMENT, style);

        // Association
        style = {};
        style[mxConstants.STYLE_STARTARROW] = 'none';
        style[mxConstants.STYLE_ENDARROW] = 'none';
        stylesheet.putCellStyle(this.edgeTypes.ASSOCIATION, style);
        
        // Directed Association
        style = {};
        style[mxConstants.STYLE_STARTARROW] = 'none';
        style[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_OPEN;
        stylesheet.putCellStyle(this.edgeTypes.DIRECTED_ASSOCIATION, style);

        // Realization
        style = {};
        style[mxConstants.STYLE_STARTARROW] = 'none';
        style[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_BLOCK;
        style[mxConstants.STYLE_ENDFILL] = 0;
        style[mxConstants.STYLE_DASHED] = 1;
        stylesheet.putCellStyle(this.edgeTypes.REALIZATION, style);
    }
	
	addNode(name) {
		var parent = this.graph.getDefaultParent();

		this.graph.getModel().beginUpdate();

		var node;
		try {
			node = this.graph.insertVertex(parent, null, name, 20, 20, 80, 30);
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
        }
        finally {
            this.graph.getModel().endUpdate();
            alert('done');
        }
	}
    /*
    addClass() {
        var field = new mxCell('+ field: type', new mxGeometry(0, 0, 100, 26), 'text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;whiteSpace=wrap;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;');
        field.vertex = true;
        
        var divider = new mxCell('', new mxGeometry(0, 0, 40, 8), 'line;html=1;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=3;spacingRight=3;rotatable=0;labelPosition=right;points=[];portConstraint=eastwest;');
        divider.vertex = true;
        
        var style = 'swimlane;html=1;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeLast=0;collapsible=1;marginBottom=0;swimlaneFillColor=#ffffff;';
        var cell = new mxCell('Classname', new mxGeometry(0, 0, 160, 90), style);
        cell.vertex = true;
        cell.insert(field.clone());
        cell.insert(divider.clone());
        //cell.insert(sb.cloneCell(field, '+ method(type): type'));
        
        return createItem([cell], cell.geometry.width, cell.geometry.height, 'Class'); 
    }
    
    
    createItem(cells, title, showLabel, showTitle, width, height, allowCellsInserted) {
        var elt = document.createElement('a');
        elt.setAttribute('href', 'javascript:void(0);');
        elt.className = 'geItem';
        elt.style.overflow = 'hidden';
        var border = (mxClient.IS_QUIRKS) ? 8 + 2 * this.thumbPadding : 2 * this.thumbBorder;
        elt.style.width = (this.thumbWidth + border) + 'px';
        elt.style.height = (this.thumbHeight + border) + 'px';
        elt.style.padding = this.thumbPadding + 'px';
        
        if (mxClient.IS_IE6)
        {
            elt.style.border = 'none';
        }
        
        // Blocks default click action
        mxEvent.addListener(elt, 'click', function(evt)
        {
            mxEvent.consume(evt);
        });

        this.createThumb(cells, this.thumbWidth, this.thumbHeight, elt, title, showLabel, showTitle, width, height);
        var bounds = new mxRectangle(0, 0, width, height);
        
        if (cells.length > 1 || cells[0].vertex)
        {
            var ds = this.createDragSource(elt, this.createDropHandler(cells, true, allowCellsInserted,
                bounds), this.createDragPreview(width, height), cells, bounds);
            this.addClickHandler(elt, ds, cells);
        
            // Uses guides for vertices only if enabled in graph
            ds.isGuidesEnabled = mxUtils.bind(this, function()
            {
                return this.editorUi.editor.graph.graphHandler.guidesEnabled;
            });
        }
        else if (cells[0] != null && cells[0].edge)
        {
            var ds = this.createDragSource(elt, this.createDropHandler(cells, false, allowCellsInserted,
                bounds), this.createDragPreview(width, height), cells, bounds);
            this.addClickHandler(elt, ds, cells);
        }
        
        // Shows a tooltip with the rendered cell
        if (!mxClient.IS_IOS)
        {
            mxEvent.addGestureListeners(elt, null, mxUtils.bind(this, function(evt)
            {
                if (mxEvent.isMouseEvent(evt))
                {
                    this.showTooltip(elt, cells, bounds.width, bounds.height, title, showLabel);
                }
            }));
        }
        
        return elt;
    };
    */

}