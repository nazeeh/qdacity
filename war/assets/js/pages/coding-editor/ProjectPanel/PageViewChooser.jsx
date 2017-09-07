import React from 'react';
import styled from 'styled-components';

import {
	PageView
} from '../View/PageView.js';

import {
	BtnDefault,
	BtnPrimary
} from '../../../common/styles/Btn.jsx';

const StyledButtonGroup = styled.div `
    display: flex;
    justify-content: center;

	padding-bottom: 5px;
`;
const StyledEditorBtn = BtnPrimary.extend `
	display: ${props => props.showBtn ? 'block' : 'none'};
`;

export default class PageViewChooser extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			view: PageView.CODING
		};
	}

	componentDidMount() {
		this.props.viewChanged(PageView.CODING);
	}

	buttonCodingEditorClicked() {
		this.setView(PageView.CODING);
	}

	buttonTextEditorClicked() {
		this.setView(PageView.TEXT);
	}

	buttonUmlEditorClicked() {
		this.setView(PageView.UML);
	}

	setView(view) {
		const changed = this.state.view != view ? true : false;

		this.setState({
			view: view
		});

		if (changed) {
			this.props.viewChanged(view);
		}
	}

	render() {
		if (this.props.project.getType() === "VALIDATION") return null;
		return (
			<StyledButtonGroup className="btn-group">
				<StyledEditorBtn showBtn={true} active={this.state.view == PageView.CODING} type="button" className="btn" onClick={this.buttonCodingEditorClicked.bind(this)}>Coding-Editor</StyledEditorBtn>
		        <StyledEditorBtn showBtn={true} active={this.state.view == PageView.TEXT} className="btn" onClick={this.buttonTextEditorClicked.bind(this)}>Text-Editor</StyledEditorBtn>
		        <StyledEditorBtn showBtn={this.props.project.isUmlEditorEnabled()} active={this.state.view == PageView.UML} type="button" className="btn" onClick={this.buttonUmlEditorClicked.bind(this)}>Uml-Editor</StyledEditorBtn>
		    </StyledButtonGroup>
		);
	}
}