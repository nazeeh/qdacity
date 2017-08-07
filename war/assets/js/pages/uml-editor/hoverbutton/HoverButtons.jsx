import React from 'react';
import styled, {
	keyframes,
	css
} from 'styled-components';

import ChangeMetaModelButton from './ChangeMetaModelButton.jsx';
import AddFieldButton from './AddFieldButton.jsx';
import AddMethodButton from './AddMethodButton.jsx';
import AddEdgeButton from './AddEdgeButton.jsx';
import AddEdgeGeneralizationButton from './AddEdgeGeneralizationButton.jsx';
import AddEdgeAggregationButton from './AddEdgeAggregationButton.jsx';
import AddEdgeAssociationButton from './AddEdgeAssociationButton.jsx';


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

		this.addEdgeGeneralizationButton = null;
		this.addEdgeAggregationButton = null;
		this.addEdgeAssociationButton = null;
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

	getAddEdgeAggregationButton() {
		return this.addEdgeAggregationButton;
	}

	getAddEdgeGeneralizationButton() {
		return this.addEdgeGeneralizationButton;
	}

	getAddEdgeAssociationButton() {
		return this.addEdgeAssociationButton;
	}

	render() {
		const _this = this;

		if (!this.state.show) {
			return null;
		}

		return (
			<div>
                <ChangeMetaModelButton umlEditor={this.props.umlEditor} cell={this.state.cell} x={this.state.x} y={this.state.y} width={this.state.width} height={this.state.height} scale={this.state.scale}></ChangeMetaModelButton>
                <AddFieldButton umlEditor={this.props.umlEditor} cell={this.state.cell} x={this.state.x} y={this.state.y} width={this.state.width} height={this.state.height} scale={this.state.scale}></AddFieldButton>

                <AddMethodButton umlEditor={this.props.umlEditor} cell={this.state.cell} x={this.state.x} y={this.state.y} width={this.state.width} height={this.state.height} scale={this.state.scale}></AddMethodButton>

                <AddEdgeButton hoverButtons={this} umlEditor={this.props.umlEditor} cell={this.state.cell} x={this.state.x} y={this.state.y} width={this.state.width} height={this.state.height} scale={this.state.scale}></AddEdgeButton>
                <AddEdgeGeneralizationButton ref={(addEdgeGeneralizationButton) => {_this.addEdgeGeneralizationButton = addEdgeGeneralizationButton}} umlEditor={this.props.umlEditor} cell={this.state.cell} show={false} x={this.state.x} y={this.state.y} width={this.state.width} height={this.state.height} scale={this.state.scale}></AddEdgeGeneralizationButton>
                <AddEdgeAggregationButton ref={(addEdgeAggregationButton) => {_this.addEdgeAggregationButton = addEdgeAggregationButton}} umlEditor={this.props.umlEditor} cell={this.state.cell} show={false} x={this.state.x} y={this.state.y} width={this.state.width} height={this.state.height} scale={this.state.scale}></AddEdgeAggregationButton>
                <AddEdgeAssociationButton ref={(addEdgeAssociationButton) => {_this.addEdgeAssociationButton = addEdgeAssociationButton}} umlEditor={this.props.umlEditor} cell={this.state.cell} show={false} x={this.state.x} y={this.state.y} width={this.state.width} height={this.state.height} scale={this.state.scale}></AddEdgeAssociationButton>
            </div>
		);
	}
}