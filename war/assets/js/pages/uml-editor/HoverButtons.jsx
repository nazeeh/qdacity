import React from 'react';
import styled from 'styled-components';

const StyledButton = styled.div `
    position: absolute;
    left: ${props => props.x + "px"};
    top: ${props => (props.y + 51) + "px"};
    width: ${props => (props.scale * 32) + "px"} !important;
    height: ${props => (props.scale * 32) + "px"} !important;
    background-color: red;
`;

export default class HoverButtons extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			show: false,
			x: 0,
			y: 0,
			scale: 1
		};
	}

	show(cell) {
		this.setState({
			show: true
		});
	}

	hide() {
		this.setState({
			show: false
		});
	}

	update(x, y, width, height, scale) {
		this.setState({
			x: x,
			y: y,
			scale: scale
		});
	}

	render() {
		if (!this.state.show) {
			return null;
		}

		return (
			<StyledButton x={this.state.x} y={this.state.y} scale={this.state.scale}></StyledButton>
		);
	}
}