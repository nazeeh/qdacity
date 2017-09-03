import React from 'react';
import styled from 'styled-components';

const StyledApplyLayoutBtn = styled.button `
	margin-left: 25px;
`;

const ButtonText = styled.span `
    margin-left: 6px;
`;

export default class ButtonApplyLayout extends React.Component {

	constructor(props) {
		super(props);

		this.umlEditor = this.props.umlEditor;
	}

	buttonClicked() {
		this.umlEditor.getUmlGraphView().applyLayout();
	}

	render() {
		const _this = this;

		return (
			<StyledApplyLayoutBtn onClick={_this.buttonClicked.bind(_this)} type="button" className="btn btn-default">
		        <i className="fa fa-th"></i>
		        <ButtonText>Apply Layout</ButtonText>
	        </StyledApplyLayoutBtn>
		);
	}

}