import React from 'react';
import styled from 'styled-components';

const StyledZoomBtn = styled.button `
	margin-left: 10px;
`;

export default class ButtonZoomOut extends React.Component {

	constructor(props) {
		super(props);

		this.umlEditor = this.props.umlEditor;
	}

	buttonClicked() {
		this.umlEditor.getUmlGraphView().zoomOut();
	}

	render() {
		const _this = this;

		return (
			<StyledZoomBtn onClick={_this.buttonClicked.bind(_this)} type="button" className="btn btn-default">
		        <i className="fa fa-search-minus"></i>
	        </StyledZoomBtn>
		);
	}

}