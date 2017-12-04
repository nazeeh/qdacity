import React from 'react';
import styled from 'styled-components';

import {
	BtnDefault
} from '../../../common/styles/Btn.jsx';

const StyledButton = BtnDefault.extend `
	margin-left: 10px;
`;

export default class ButtonCollapseAll extends React.Component {

	constructor(props) {
		super(props);

		this.umlEditor = this.props.umlEditor;

		this.buttonClicked = this.buttonClicked.bind(this);
	}

	buttonClicked() {
		this.umlEditor.getGraphView().collapseAll();
	}

	render() {
		const _this = this;

		return (
			<StyledButton title="Collapses all classes." onClick={_this.buttonClicked}>
		        <i className="fa fa-minus-square-o"></i>
		        <span>Collapse all</span>
	        </StyledButton>
		);
	}

}