import React from 'react';
import styled from 'styled-components';

import HoverButton from './HoverButton.jsx';

const Image = styled.i`
	position: absolute;
	left: -1px;
	top: -1px;
	width: inherit !important;
	height: inherit !important;
	line-height: inherit !important;

	font-size: ${props => props.height * 0.4 + 'px'} !important;
	text-align: center;
`;

export default class ImageHoverButton extends HoverButton {
	constructor(props) {
		super(props);
	}

	getImageClassName() {
		return '';
	}

	renderContent(x, y, width, height) {
		const className = 'fa ' + this.getImageClassName();

		return <Image className={className} width={width} height={height} />;
	}
}
