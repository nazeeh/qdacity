import React from 'react';
import styled from 'styled-components';

import ImageHoverButton from './ImageHoverButton.jsx';

export default class RemoveEdgeButton extends ImageHoverButton {

	constructor(props) {
		super(props);
	}

	onClick() {
		this.props.umlEditor.deleteEdge(this.props.cell.source, this.props.cell.value.relationId);
	}

	getImageClassName() {
		return 'fa-trash';
	}

	getToolTip() {
		return 'Removes the edge (relation) from the model.';
	}

	getBounds() {
		const sizeX = 34;
		const sizeY = 32;

		const width = sizeX * this.props.scale;
		const height = sizeY * this.props.scale;

		// TODO 
		// Weil x und y hier nicht benutzt wird, wird es nicht beim update verschoben

		let state = this.props.umlEditor.getGraphView().graph.view.getState(this.props.cell);

		let handler = this.props.umlEditor.getGraphView().graph.selectionCellsHandler.handlers.get(this.props.cell);

		let abspoints = handler.abspoints;

		let x = handler.labelShape.bounds.x - width / 2;
		let y = handler.labelShape.bounds.y - height / 2;

		const offset = 5 * this.props.scale;

		if (abspoints.length == 3) {
			// Do nothing
		} else if (abspoints[0].x == abspoints[1].x) {
			x = abspoints[0].x + offset;
		} else if (abspoints[0].y == abspoints[1].y) {
			y = abspoints[0].y + offset;
		}

		x = x + this.props.x - state.x;
		y = y + this.props.y - state.y;

		return [x, y, width, height];
	}
}