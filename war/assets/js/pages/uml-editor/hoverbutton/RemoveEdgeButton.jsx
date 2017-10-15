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

	getBounds() {
		const sizeX = 34;
		const sizeY = 32;

		const width = sizeX * this.props.scale;
		const height = sizeY * this.props.scale;
		let x = this.props.x + this.props.width / 2 - width / 2;
		let y = this.props.y + this.props.height / 2 - height / 2;

		var g = this.props.umlEditor.getGraphView().graph.getModel().getGeometry(this.props.cell);
		var pts = g.points;


		let state = this.props.umlEditor.getGraphView().graph.getView().getCellStates(this.props.cell);

		let handler = this.props.umlEditor.getGraphView().graph.selectionCellsHandler.handlers.get(this.props.cell);

		let abspoints = handler.abspoints;

		x = handler.labelShape.bounds.x - width / 2;
		y = handler.labelShape.bounds.y - height / 2;

		const offset = 5 * this.props.scale;

		if (abspoints.length == 3) {
			// Do nothing
		} else if (abspoints[0].x == abspoints[1].x) {
			x = abspoints[0].x + offset;
		} else if (abspoints[0].y == abspoints[1].y) {
			y = abspoints[0].y + offset;
		}

		return [x, y, width, height];
	}
}