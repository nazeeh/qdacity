import React from 'react';
import {
	FormattedMessage
} from 'react-intl';
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
		const changed = this.props.view != view ? true : false;

		if (changed) {
			this.props.viewChanged(view);
		}
	}

	render() {
		if (this.props.project.getType() === "VALIDATION") return null;

		const view = this.props.view;

		return (
			<StyledButtonGroup className="btn-group">
				<StyledEditorBtn
					showBtn={true}
					active={view == PageView.CODING}
					type="button"
					className="btn"
					onClick={this.buttonCodingEditorClicked.bind(this)}
				>
					<FormattedMessage id='pageviewchooser.coding' defaultMessage='Coding-Editor' />
				</StyledEditorBtn>
		        <StyledEditorBtn
					showBtn={true}
					active={view == PageView.TEXT}
					className="btn"
					onClick={this.buttonTextEditorClicked.bind(this)}
				>
					<FormattedMessage id='pageviewchooser.text' defaultMessage='Text-Editor' />
				</StyledEditorBtn>
		        <StyledEditorBtn
					showBtn={this.props.project.isUmlEditorEnabled()}
					active={view == PageView.UML}
					type="button"
					className="btn"
					onClick={this.buttonUmlEditorClicked.bind(this)}
				>
					<FormattedMessage id='pageviewchooser.uml' defaultMessage='UML-Editor' />
				</StyledEditorBtn>
		    </StyledButtonGroup>
		);
	}
}