import React from 'react';

export default class MyEditorView extends React.Component {
    
	constructor(props) {
		super(props);
		
		this.graph = null;
		this.layout = null;
		
		this.edgeTypes = this.props.edgeTypes;
		
		this.edgeStyles = {}
        this.edgeStyles[this.edgeTypes.NONE] = 'startArrow=none;endArrow=none;';
		this.edgeStyles[this.edgeTypes.GENERALIZATION] = 'startArrow=none;endArrow=' + mxConstants.ARROW_BLOCK + ';endFill=0;';
		this.edgeStyles[this.edgeTypes.DEPENDENCY] = 'startArrow=none;endArrow=' + mxConstants.ARROW_OPEN + ';dashed=1';
		this.edgeStyles[this.edgeTypes.AGGREGATION] = 'startArrow=' + mxConstants.ARROW_DIAMOND_THIN + ';endArrow=none;startFill=0;startSize=20;';
		this.edgeStyles[this.edgeTypes.CONTAINMENT] = 'startArrow=' + mxConstants.ARROW_DIAMOND_THIN + ';endArrow=none;startFill=1;startSize=20;';
		this.edgeStyles[this.edgeTypes.ASSOCIATION] = 'startArrow=none;endArrow=none;';
		this.edgeStyles[this.edgeTypes.DIRECTED_ASSOCIATION] = 'startArrow=none;endArrow=' + mxConstants.ARROW_OPEN + ';';
		this.edgeStyles[this.edgeTypes.REALIZATION] = 'startArrow=none;endArrow=' + mxConstants.ARROW_BLOCK + ';endFill=0;dashed=1';
	}

	run() {
		var container = document.getElementById('graphContainer');

		// Disables the built-in context menu
		mxEvent.disableContextMenu(container);

		// Creates the graph inside the given container
		this.graph = new mxGraph(container);
		
		
        // WHAT DOES THAT DO?
        this.graph.setPanning(true);
        //this.graph.alternateEdgeStyle = 'elbow=vertical';
		
        var styleX = this.graph.getStylesheet().getDefaultEdgeStyle();
        styleX[mxConstants.STYLE_EDGE] = mxEdgeStyle.SegmentConnector;//mxEdgeStyle.OrthConnector;
        //
        
        
        // Sets default styles
        var style = this.graph.getStylesheet().getDefaultVertexStyle();
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
		
		
		
		// Enables rubberband selection
		new mxRubberband(this.graph);

		
		this.layout = new mxFastOrganicLayout(this.graph);
        // Moves stuff wider apart than usual
        this.layout.forceConstant = 180;
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
            edge = this.graph.insertEdge(parent, null, '', v1, v2, this.edgeStyles[edgeType]);
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
	
	render() {
		return (
			<div id="graphContainer" style={{position:'relative', overflow:'hidden', width:'1200px', height:'800px', cursor:'default'}}></div>
		);
	}


}