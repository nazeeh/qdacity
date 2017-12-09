import React from 'react';
import styled from 'styled-components';

import {
	EdgeType
} from '../util/EdgeType.js';

import HoverButton from './HoverButton.jsx';

export default class AddEdgeAssociationButton extends HoverButton {

	constructor(props) {
		super(props);
	}

	onClick() {
		this.props.umlEditor.getGraphView().startConnecting(EdgeType.DIRECTED_ASSOCIATION);
	}

	getButtonClassName() {
		return 'umlOverlayButton umlOverlayButtonAddEdgeAssociation';
	}

	getToolTip() {
		return 'Add a new association.';
	}

	getBounds() {
		const sizeX = 34;
		const sizeY = 32;

		const offsetToNode = 6;
		const offsetToButton = 6;

		const x = this.props.x + this.props.width + offsetToNode * this.props.scale + sizeX * this.props.scale + offsetToButton * this.props.scale;
		const y = this.props.y;
		const width = sizeX * this.props.scale;
		const height = sizeY * this.props.scale;

		return [x, y, width, height];
	}
}