import EdgeValue from './EdgeValue.js';

export default class GraphConnectionHandler {

	constructor(umlEditor, umlGraphView, graph) {
		this.umlEditor = umlEditor;
		this.umlGraphView = umlGraphView;
		this.graph = graph;

		this.cellMarker = null;

		this.connectionHandler = null;
		this.connectionEdgeStartCell = null;

		this.init();
	}

	init() {
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
			return _this.umlGraphView.isCellUmlClass(cell);
		};

		this.connectionHandler.getEdgeWidth = function (valid) {
			return 1;
		};

		this.connectionHandler.addListener(mxEvent.START, function (sender, evt) {
			_this.connectionEdgeStartCell = evt.properties.state.cell;
		});

		this.connectionHandler.addListener(mxEvent.RESET, function (sender, evt) {
			_this.umlGraphView.selectCell(_this.connectionEdgeStartCell);

			_this.connectionEdgeStartCell = null;
		});

		this.connectionHandler.addListener(mxEvent.CONNECT, function (sender, evt) {
			_this.cellMarker.process(new mxMouseEvent());

			_this.connectionEdgeStartCell = null;

			const edgeType = evt.properties.cell.style;
			const sourceNode = evt.properties.cell.source;
			const destinationNode = evt.properties.cell.target;

			const sourceCode = _this.umlEditor.getCodeById(sourceNode.value.getCodeId());
			const destinationCode = _this.umlEditor.getCodeById(destinationNode.value.getCodeId());

			_this.umlEditor.createEdge(sourceCode, destinationCode, edgeType);

			_this.umlGraphView.selectCell(sourceNode);
		});
	}

	isConnectingEdge() {
		return this.connectionEdgeStartCell != null;
	}

	startConnecting(edgeType) {
		let edge = this.graph.createEdge(null, null, null, null, null, edgeType);
		let edgeState = new mxCellState(this.graph.view, edge, this.graph.getCellStyle(edge));

		let cellState = this.graph.getView().getState(this.graph.getSelectionCell(), true);

		this.connectionHandler.start(cellState, 0, 0, edgeState);

		this.umlGraphView.hideHoverButtons();
	}

	resetConnectingEdge() {
		this.connectionHandler.reset();
	}
}