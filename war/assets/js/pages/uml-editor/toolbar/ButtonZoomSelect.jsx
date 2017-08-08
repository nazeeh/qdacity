import React from 'react';
import styled from 'styled-components';

const StyledZoomSelector = styled.div `
	margin-left: 10px;
	display: inline-block;
	width: 75px;
`;

const StyledZoomBtn = styled.button `
	width: 75px;
`;

const StyledCaret = styled.span `
	margin-left: 5px !important;
`;

const StyledDropDown = styled.ul `
	min-width: 90px;
`;

export default class ButtonZoomSelect extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			zoomValue: this.getZoomValue(100)
		}

		this.umlEditor = this.props.umlEditor;
	}

	buttonClicked(zoom) {
		this.umlEditor.getUmlGraphView().zoomTo(zoom);
	}

	onZoom(percentage) {
		this.setState({
			zoomValue: this.getZoomValue(percentage)
		});
	}

	getZoomValue(percentage) {
		const rounded = Math.round(percentage * 100) / 100;
		return (rounded) + '%';
	}

	render() {
		const _this = this;

		return (
			<StyledZoomSelector className='dropdown'>
                <StyledZoomBtn className='btn btn-default dropdown-toggle' type='button' data-toggle='dropdown'>
		            {this.state.zoomValue}
                    <StyledCaret className='caret'></StyledCaret>
                </StyledZoomBtn>
                <StyledDropDown className='dropdown-menu'>
                    <li><a onClick={_this.buttonClicked.bind(_this, 10)} href='#'>10 %</a></li>
                    <li><a onClick={_this.buttonClicked.bind(_this, 30)} href='#'>30 %</a></li>
                    <li><a onClick={_this.buttonClicked.bind(_this, 50)} href='#'>50 %</a></li>
                    <li><a onClick={_this.buttonClicked.bind(_this, 80)} href='#'>80 %</a></li>
                    <li><a onClick={_this.buttonClicked.bind(_this, 100)} href='#'>100 %</a></li>
                    <li><a onClick={_this.buttonClicked.bind(_this, 120)} href='#'>120 %</a></li>
                    <li><a onClick={_this.buttonClicked.bind(_this, 150)} href='#'>150 %</a></li>
                </StyledDropDown>
            </StyledZoomSelector>
		);
	}

}