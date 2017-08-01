import React from 'react';
import styled, {
	keyframes,
	css
} from 'styled-components';

import ChangeMetaModelButton from './ChangeMetaModelButton.jsx';
import AddFieldButton from './AddFieldButton.jsx';
import AddMethodButton from './AddMethodButton.jsx';



const test1 = (props) => {
	return "0px;"
};
const test2 = (props) => {
	return props.x + "px;"
};

const AnimationASD = (props) => keyframes `
    0% {
        left: ${test1(props)};
    }

    100% {
        left: ${test2(props)};
    }
`;

const StyledButton = styled.div `
    position: absolute;
    top: ${props => props.y + "px"};
    width: ${props => props.width + "px"} !important;
    height: ${props => props.height + "px"} !important;
    background-color: ${props => props.color};
    
    animation: ${props => css`
        ${AnimationASD} 3s linear forwards;
    `}
`;






export default class HoverButtons extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			cell: null,
			show: false,
			x: 0,
			y: 0,
			width: 0,
			height: 0,
			scale: 1
		};
	}

	show(cell) {
		this.setState({
			cell: cell,
			show: true
		});
	}

	hide() {
		this.setState({
			cell: null,
			show: false
		});
	}

	update(x, y, width, height, scale) {
		this.setState({
			x: x,
			y: y,
			width: width,
			height: height,
			scale: scale
		});
	}

	render() {
		if (!this.state.show) {
			return null;
		}

		return (
			<div>               
                <ChangeMetaModelButton umlEditor={this.props.umlEditor} cell={this.state.cell} x={this.state.x} y={this.state.y} width={this.state.width} height={this.state.height} scale={this.state.scale}></ChangeMetaModelButton>
                <AddFieldButton umlEditor={this.props.umlEditor} cell={this.state.cell} x={this.state.x} y={this.state.y} width={this.state.width} height={this.state.height} scale={this.state.scale}></AddFieldButton>
                <AddMethodButton umlEditor={this.props.umlEditor} cell={this.state.cell} x={this.state.x} y={this.state.y} width={this.state.width} height={this.state.height} scale={this.state.scale}></AddMethodButton>
            </div>
		);
	}
}