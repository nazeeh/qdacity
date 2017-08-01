import React from 'react';
import styled from 'styled-components';

import ImageHoverButton from './ImageHoverButton.jsx';

export default class AddEdgeButton extends ImageHoverButton {

	constructor(props) {
		super(props);
	}

	onClick() {
		this.props.hoverButtons.getAddEdgeAggregationButton().show();
		this.props.hoverButtons.getAddEdgeGeneralizationButton().show();
		this.props.hoverButtons.getAddEdgeAssociationButton().show();
	}

	getImageClassName() {
		return 'fa-plus';
	}

	getBounds() {
		const offsetTop = this.getOffsetTop();

		const sizeX = 34;
		const sizeY = 32;

		const offsetToNode = 6;

		const x = this.props.x + this.props.width + offsetToNode * this.props.scale;
		const y = this.props.y + offsetTop;
		const width = sizeX * this.props.scale;
		const height = sizeY * this.props.scale;

		return [x, y, width, height];
	}
}