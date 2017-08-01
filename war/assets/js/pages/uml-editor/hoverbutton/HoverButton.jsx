import React from 'react';
import styled from 'styled-components';

const StyledButton = styled.div `
    position: absolute;
    left: ${props => props.x + "px"};
    top: ${props => props.y + "px"};
    width: ${props => props.width + "px"} !important;
    height: ${props => props.height + "px"} !important;
    
    border: ${props => (1 * props.scale) + "px"} solid #cccccc;
    border-radius: ${props => (4 * props.scale) + "px"};
    background-color: white;
    
    cursor: pointer;
    
    &:hover {
        background-color: #e6e6e6;
        border-color: #adadad;
    }
    
    &:active {        
        background-color: #d6d6d6;
        border-color: #8d8d8d;
        box-shadow: inset 0 3px 5px rgba(0, 0, 0, .125);
    }
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

	onClick() {

	}

	getOffsetTop() {
		return this.props.umlEditor.getToolbar().getHeight();
	}

	getBounds() {
		return [0, 0, 0, 0];
	}

	renderContent(x, y, width, height) {
		return null;
	}

	render() {
		if (!this.state.show) {
			return null;
		}

		const [x, y, width, height] = this.getBounds();
		const scale = this.props.scale;

		// Dont display if out of bounds
		if (x < 0 || y < this.getOffsetTop()) {
			return null;
		}

		return (
			<StyledButton x={x} y={y} width={width} height={height} scale={scale} onClick={this.onClick}>
		        {this.renderContent(x, y, width, height)}
		    </StyledButton>
		);
	}
}