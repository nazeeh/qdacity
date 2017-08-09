import React from 'react';
import styled from 'styled-components';

import {
	EdgeType
} from '../EdgeType.js';

import ImageHoverButton from './ImageHoverButton.jsx';

export default class AddEdgeAggregationButton extends ImageHoverButton {

	constructor(props) {
		super(props);
	}

	onClick() {
		this.props.umlEditor.getUmlGraphView().startConnecting(EdgeType.AGGREGATION);
	}

	getImageClassName() {
		return 'fa-plus';
	}

	getBounds() {
		const offsetTop = this.getOffsetTop();

		const sizeX = 34;
		const sizeY = 32;

		const offsetToNode = 6;
		const offsetToButton = 6;

		const x = this.props.x + this.props.width + offsetToNode * this.props.scale + sizeX * this.props.scale + offsetToButton * this.props.scale;
		const y = this.props.y + offsetTop - offsetToButton * this.props.scale - sizeY * this.props.scale;
		const width = sizeX * this.props.scale;
		const height = sizeY * this.props.scale;

		return [x, y, width, height];
	}
}