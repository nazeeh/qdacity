import React from 'react';
import styled from 'styled-components';

import ImageHoverButton from './ImageHoverButton.jsx';

export default class ChangeMetaModelButton extends ImageHoverButton {

	constructor(props) {
		super(props);
	}

	onClick() {
		alert('CLICKED');
	}

	getImageClassName() {
		return 'fa-list-alt';
	}

	getBounds() {
		const offsetTop = this.getOffsetTop();

		const sizeX = 34;
		const sizeY = 32;

		const offsetToNode = 6;

		const x = this.props.x;
		const y = (this.props.y + offsetTop) - (this.props.scale * sizeY) - offsetToNode * this.props.scale;
		const width = sizeX * this.props.scale;
		const height = sizeY * this.props.scale;

		return [x, y, width, height];
	}
}