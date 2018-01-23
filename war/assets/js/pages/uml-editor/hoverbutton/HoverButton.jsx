import React from 'react';
import styled from 'styled-components';

import { BtnDefault } from '../../../common/styles/Btn.jsx';

const StyledButton = BtnDefault.extend`
	position: absolute;
	left: ${props => props.x + 'px'};
	top: ${props => props.y + 'px'};
	width: ${props => props.width + 'px'} !important;
	height: ${props => props.height + 'px'} !important;
	line-height: ${props => props.height + 'px'} !important;

	padding: 0px !important;

	border-width: ${props => 1 * props.scale + 'px'};

	cursor: pointer;
	pointer-events: auto;
`;

export default class HoverButton extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			show: this.props.show != null ? this.props.show : true
		};

		this.onClick = this.onClick.bind(this);
	}

	show() {
		this.setState({
			show: true
		});
	}

	hide() {
		this.setState({
			show: false
		});
	}

	onClick() {}

	getBounds() {
		return [0, 0, 0, 0];
	}

	renderContent(x, y, width, height) {
		return null;
	}

	getButtonClassName() {
		return '';
	}

	getToolTip() {
		return '';
	}

	render() {
		if (!this.state.show) {
			return null;
		}

		const [x, y, width, height] = this.getBounds();
		const scale = this.props.scale;

		// Dont display if out of bounds
		if (x < 0 || y < 0) {
			return null;
		}

		return (
			<StyledButton
				title={this.getToolTip()}
				className={this.getButtonClassName()}
				x={x}
				y={y}
				width={width}
				height={height}
				scale={scale}
				onClick={this.onClick}
			>
				{this.renderContent(x, y, width, height)}
			</StyledButton>
		);
	}
}
