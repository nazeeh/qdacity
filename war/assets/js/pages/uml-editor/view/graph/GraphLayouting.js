import Cell from '../Cell.jsx';

export default class GraphLayouting {

	constructor(graph) {
		this.graph = graph;

		this.autoLayoutOffsetTop = 50;
		this.autoLayoutOffsetLeft = 60;
		this.autoLayoutOffsetNextX = 50;
		this.autoLayoutOffsetNextY = 30;

		this.umlClassDefaultWidth = Cell.getDefaultWidth();
		this.umlClassDefaultHeight = Cell.getDefaultHeight();

		this.layout = null;

		this.init();
	}

	init() {
		// Enables layouting
		this.layout = new mxFastOrganicLayout(this.graph);
		this.layout.disableEdgeStyle = false;
		this.layout.forceConstant = 200;
		this.layout.forceConstantSquared = this.layout.forceConstant * this.layout.forceConstant;
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
		// Bounds
		let width = this.umlClassDefaultWidth;
		let height = this.umlClassDefaultHeight;

		if (cell != null) {
			width = cell.getGeometry().width;
			height = cell.getGeometry().height;
		}

		// Find position
		let x = this.autoLayoutOffsetLeft;
		let y = this.autoLayoutOffsetTop;
		let offsetX = this.umlClassDefaultWidth + this.autoLayoutOffsetNextX;
		let offsetY = this.umlClassDefaultHeight + this.autoLayoutOffsetNextY;

		while (true) {
			for (let i = 0; i < 10; i++) {
				if (this.isAreaFree(cell, x, y, width, height)) {
					return [x, y];
				}

				x = x + offsetX;
			}

			x = 0;
			y = y + offsetY;
		}

		return [x, y];
	}

	isAreaFree(cell, x, y, width, height) {
		// Does the area contain another node?
		const allNodes = this.graph.getModel().getChildren(this.graph.getDefaultParent());

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
	}
}