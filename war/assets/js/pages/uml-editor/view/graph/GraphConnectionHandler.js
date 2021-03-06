import EdgeValue from '../value/EdgeValue.js';

export default class GraphConnectionHandler {
	constructor(umlEditor, graphView, graph) {
		this.umlEditor = umlEditor;
		this.graphView = graphView;
		this.graph = graph;

		this.connectionHandler = null;
		this.connectionEdgeStartCell = null;

		this.init();
	}

	init() {
		const _this = this;

		mxCellHighlight.prototype.spacing = 0;

		this.connectionEdgeStartCell = null;

		// Mouse listener
		const connectionMouseListener = {
			mouseDown: function(sender, me) {},
			mouseMove: function(sender, me) {},
			mouseUp: function(sender, me) {
				if (_this.isConnectingEdge()) {
					me.consumed = false;
					_this.connectionHandler.marker.process(me);
				}
			}
		};

		_this.graph.addMouseListener(connectionMouseListener);

		// Connection Handler
		this.connectionHandler = new mxConnectionHandler(this.graph, function(
			source,
			target,
			style
		) {
			const edgeValue = new EdgeValue(-1);

			const edge = new mxCell(edgeValue, new mxGeometry());
			edge.setEdge(true);
			edge.setStyle(style);
			edge.geometry.relative = true;
			return edge;
		});
		this.connectionHandler.livePreview = true;
		this.connectionHandler.select = false;
		this.connectionHandler.marker.setEnabled(false);

		this.connectionHandler.isValidTarget = function(cell) {
			return _this.graphView.isCellUmlClass(cell);
		};

		this.connectionHandler.getEdgeWidth = function(valid) {
			return 1;
		};

		this.connectionHandler.addListener(mxEvent.START, function(sender, evt) {
			_this.connectionHandler.marker.setEnabled(true);

			_this.connectionEdgeStartCell = evt.properties.state.cell;
		});

		this.connectionHandler.addListener(mxEvent.RESET, function(sender, evt) {
			_this.graphView.selectCell(_this.connectionEdgeStartCell);

			_this.connectionHandler.marker.setEnabled(false);

			_this.connectionEdgeStartCell = null;
		});

		this.connectionHandler.addListener(mxEvent.CONNECT, function(sender, evt) {
			_this.connectionHandler.marker.process(new mxMouseEvent());

			_this.connectionHandler.marker.setEnabled(false);

			_this.connectionEdgeStartCell = null;

			const edgeType = evt.properties.cell.style;
			const sourceNode = evt.properties.cell.source;
			const destinationNode = evt.properties.cell.target;

			const sourceCode = _this.umlEditor.getCodeById(
				sourceNode.value.getCodeId()
			);
			const destinationCode = _this.umlEditor.getCodeById(
				destinationNode.value.getCodeId()
			);

			_this.umlEditor.createEdge(sourceCode, destinationCode, edgeType);

			_this.graphView.selectCell(sourceNode);
		});
	}

	isConnectingEdge() {
		return this.connectionEdgeStartCell != null;
	}

	startConnecting(edgeType) {
		let edge = this.graph.createEdge(null, null, null, null, null, edgeType);
		let edgeState = new mxCellState(
			this.graph.view,
			edge,
			this.graph.getCellStyle(edge)
		);

		let cellState = this.graph
			.getView()
			.getState(this.graph.getSelectionCell(), true);

		this.connectionHandler.start(cellState, 0, 0, edgeState);

		this.graphView.hideHoverButtons();
	}

	resetConnectingEdge() {
		this.connectionHandler.reset();
	}
}
