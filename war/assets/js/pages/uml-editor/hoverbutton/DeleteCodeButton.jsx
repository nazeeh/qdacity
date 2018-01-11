import React from 'react';
import styled from 'styled-components';

import ImageHoverButton from './ImageHoverButton.jsx';
import IntlProvider from '../../../common/Localization/LocalizationProvider';

export default class CodingViewButton extends ImageHoverButton {

	constructor(props) {
		super(props);
	}

	onClick() {
		this.props.umlEditor.props.deleteCode(this.props.umlEditor.getCodeByNode(this.props.cell));
	}

	getImageClassName() {
		return 'fa-trash';
	}

	getToolTip() {
		const {formatMessage} = IntlProvider.intl;
		return formatMessage({id: 'removecodebutton.tooltip', defaultMessage: 'Removes the class (code) from the codesystem.'});
	}

	getBounds() {
		const sizeX = 34;
		const sizeY = 32;

		const offsetToNode = 6;
		const offsetRight = 40 * this.props.scale;

		const x = this.props.x + offsetRight;
		const y = this.props.y - (this.props.scale * sizeY) - offsetToNode * this.props.scale;
		const width = sizeX * this.props.scale;
		const height = sizeY * this.props.scale;

		return [x, y, width, height];
	}
}