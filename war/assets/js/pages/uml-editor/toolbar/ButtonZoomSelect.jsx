import React from 'react';
import styled from 'styled-components';

import DropDownButton from '../../../common/styles/DropDownButton.jsx';

const StyledZoomBtn = styled.i `
    margin-left: 10px;
    display: inline-block;
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

		const items = [];
		items.push({
			text: '10 %',
			onClick: _this.buttonClicked.bind(_this, 10)
		});
		items.push({
			text: '30 %',
			onClick: _this.buttonClicked.bind(_this, 30)
		});
		items.push({
			text: '50 %',
			onClick: _this.buttonClicked.bind(_this, 50)
		});
		items.push({
			text: '80 %',
			onClick: _this.buttonClicked.bind(_this, 80)
		});
		items.push({
			text: '100 %',
			onClick: _this.buttonClicked.bind(_this, 100)
		});
		items.push({
			text: '120 %',
			onClick: _this.buttonClicked.bind(_this, 120)
		});
		items.push({
			text: '150 %',
			onClick: _this.buttonClicked.bind(_this, 150)
		});

		return (
			<StyledZoomBtn>
		        <DropDownButton text="100 %" items={items}></DropDownButton>
	        </StyledZoomBtn>
		);
	}

}