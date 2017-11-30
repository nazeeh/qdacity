import React from 'react';
import styled from 'styled-components';

import {
	BtnDefault
} from '../../../common/styles/Btn.jsx';

const StyledButton = BtnDefault.extend `
	margin-left: 25px;
`;

export default class ButtonExpandAll extends React.Component {

	constructor(props) {
		super(props);

		this.umlEditor = this.props.umlEditor;

		this.buttonClicked = this.buttonClicked.bind(this);
	}

	buttonClicked() {
		this.umlEditor.getGraphView().expandAll();
	}

	render() {
		const _this = this;

		return (
			<StyledButton title="Expands all classes." onClick={_this.buttonClicked}>
		        <i className="fa fa-plus-square-o"></i>
		        <span>Expand all</span>
	        </StyledButton>
		);
	}

}