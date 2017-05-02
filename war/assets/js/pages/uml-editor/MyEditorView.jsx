import React from 'react';

export default class MyEditorView extends React.Component {

	constructor(props) {
		super(props);
		this.graph = null;
	}

	run() {
		var container = document.getElementById('graphContainer');

		// Disables the built-in context menu
		mxEvent.disableContextMenu(container);

		// Creates the graph inside the given container
		this.graph = new mxGraph(container);
		// Enables rubberband selection
		new mxRubberband(this.graph);

		// Gets the default parent for inserting new cells. This
		// is normally the first child of the root (ie. layer 0).
		var parent = this.graph.getDefaultParent();

		// Adds cells to the model in a single step
//		this.graph.getModel().beginUpdate();
//		try {
//			var v1 = this.graph.insertVertex(parent, null, 'Hello,', 20, 20, 80, 30);
//			var v2 = this.graph.insertVertex(parent, null, 'World!', 200, 150, 80, 30);
//			var e1 = this.graph.insertEdge(parent, null, '', v1, v2);
//		} finally {
//			// Updates the display
//			this.graph.getModel().endUpdate();
//		}
	}

	addNode(name) {
		var parent = this.graph.getDefaultParent();

		this.graph.getModel().beginUpdate();

		try {
			var v1 = this.graph.insertVertex(parent, null, name, 20, 20, 80, 30);
		} finally {
			this.graph.getModel().endUpdate();
		}
	}

	render() {
		return (
			<div id="graphContainer" style={{position:'relative', overflow:'hidden', width:'800px', height:'600px', cursor:'default'}}></div>
		);
	}


}