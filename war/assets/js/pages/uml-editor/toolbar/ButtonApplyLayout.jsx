import React from 'react';
import styled from 'styled-components';

import {
	BtnDefault
} from '../../../common/styles/Btn.jsx';

const StyledApplyLayoutBtn = BtnDefault.extend `
	margin-left: 25px;
`;

const ButtonText = styled.span `
    margin-left: 6px;
`;

export default class ButtonApplyLayout extends React.Component {

	constructor(props) {
		super(props);

		this.umlEditor = this.props.umlEditor;

		this.buttonClicked = this.buttonClicked.bind(this);
	}

	buttonClicked() {
		this.umlEditor.getUmlGraphView().applyLayout();
	}

	render() {
		const _this = this;

		return (
			<StyledApplyLayoutBtn onClick={_this.buttonClicked}>
		        <i className="fa fa-th"></i>
		        <ButtonText>Apply Layout</ButtonText>
	        </StyledApplyLayoutBtn>
		);
	}

}