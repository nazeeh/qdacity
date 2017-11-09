import React from 'react';
import styled from 'styled-components';

import ImageHoverButton from './ImageHoverButton.jsx';

export default class CodingViewButton extends ImageHoverButton {

	constructor(props) {
		super(props);
	}

	onClick() {
		this.props.toggleCodingView();
	}

	getImageClassName() {
		return 'fa-list-alt';
	}

	getToolTip() {
		return 'Opens the coding-view.';
	}

	getBounds() {
		const sizeX = 34;
		const sizeY = 32;

		const offsetToNode = 6;

		const x = this.props.x;
		const y = this.props.y - (this.props.scale * sizeY) - offsetToNode * this.props.scale;
		const width = sizeX * this.props.scale;
		const height = sizeY * this.props.scale;

		return [x, y, width, height];
	}
}