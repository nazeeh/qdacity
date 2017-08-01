import React from 'react';
import styled from 'styled-components';

import ImageHoverButton from './ImageHoverButton.jsx';

export default class AddMethodButton extends ImageHoverButton {

	constructor(props) {
		super(props);
	}

	onClick() {
		this.props.umlEditor.overlayClickedClassField(this.props.cell);
	}

	getImageClassName() {
		return 'fa-plus';
	}

	getBounds() {
		const offsetTop = this.getOffsetTop();

		const sizeX = 34;
		const sizeY = 32;

		const offsetToNode = 6;
		const offsetToButton = 7;

		const x = this.props.x + this.props.width - (sizeX * this.props.scale) * 2 - offsetToButton * this.props.scale;
		const y = (this.props.y + offsetTop) - (this.props.scale * sizeY) - offsetToNode * this.props.scale;
		const width = sizeX * this.props.scale;
		const height = sizeY * this.props.scale;

		return [x, y, width, height];
	}
}