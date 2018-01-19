import React from 'react';
import styled from 'styled-components';

import HoverButton from './HoverButton.jsx';

export default class AddEdgeButton extends HoverButton {
	constructor(props) {
		super(props);
	}

	onClick() {
		this.props.hoverButtons.getAddEdgeAggregationButton().show();
		this.props.hoverButtons.getAddEdgeGeneralizationButton().show();
		this.props.hoverButtons.getAddEdgeAssociationButton().show();
	}

	getButtonClassName() {
		return 'umlOverlayButton umlOverlayButtonAddEdge';
	}

	getToolTip() {
		return 'Adds a new edge (relation) to the model.';
	}

	getBounds() {
		const sizeX = 34;
		const sizeY = 32;

		const offsetToNode = 6;

		const x = this.props.x + this.props.width + offsetToNode * this.props.scale;
		const y = this.props.y;
		const width = sizeX * this.props.scale;
		const height = sizeY * this.props.scale;

		return [x, y, width, height];
	}
}
