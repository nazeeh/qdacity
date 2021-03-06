import { EdgeType } from '../../util/EdgeType.js';

export default class GraphStyles {
	static initializeStyles(graph) {
		GraphStyles.initializeDefaultStyles(graph);
		GraphStyles.initializeCustomStyles(graph);
	}

	static initializeDefaultStyles(graph) {
		let style;

		mxConstants.VERTEX_SELECTION_COLOR = '#00A2E8';
		mxConstants.VERTEX_SELECTION_DASHED = false;
		mxConstants.VERTEX_SELECTION_STROKEWIDTH = 1;
		mxConstants.EDGE_SELECTION_COLOR = '#00A2E8';
		mxConstants.EDGE_SELECTION_DASHED = false;
		mxConstants.EDGE_SELECTION_STROKEWIDTH = 1;

		mxConstants.OUTLINE_COLOR = '#00A2E8';
		mxConstants.OUTLINE_HANDLE_STROKECOLOR = '#00A2E8';
		mxConstants.OUTLINE_HIGHLIGHT_COLOR = '#00A2E8';
		mxConstants.DEFAULT_VALID_COLOR = '#00A2E8';
		mxConstants.HIGHLIGHT_COLOR = '##00A2E8';
		mxConstants.HIGHLIGHT_STROKEWIDTH = 3;

		mxConstants.VALID_COLOR = '#00A2E8';
		mxConstants.INVALID_COLOR = '#FF0000';

		mxConstants.HANDLE_SIZE = 0;

		style = graph.getStylesheet().getDefaultVertexStyle();
		style[mxConstants.STYLE_FILLCOLOR] = '#FFFFFF';
		style[mxConstants.STYLE_STROKECOLOR] = '#000000';
		style[mxConstants.STYLE_STROKEWIDTH] = 1;
		style[mxConstants.STYLE_ALIGN] = 'center';
		style[mxConstants.STYLE_VERTICAL_ALIGN] = 'top';

		style = graph.getStylesheet().getDefaultEdgeStyle();
		style[mxConstants.STYLE_STARTSIZE] = '13';
		style[mxConstants.STYLE_ENDSIZE] = '13';
		style[mxConstants.STYLE_STROKECOLOR] = '#000000';
		style[mxConstants.STYLE_FONTCOLOR] = '#000000';
		style[mxConstants.STYLE_FONTSTYLE] = '0';
		style[mxConstants.STYLE_EDGE] = mxEdgeStyle.SegmentConnector;
		style[mxConstants.STYLE_ROUNDED] = true;
	}

	static initializeCustomStyles(graph) {
		const stylesheet = graph.getStylesheet();
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
}
