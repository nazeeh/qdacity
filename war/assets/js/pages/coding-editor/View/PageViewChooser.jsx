import React from 'react';
import styled from 'styled-components';

import {
	PageView
} from './PageView.js';

const StyledButtonGroup = styled.div `
    display: flex;
    justify-content: center;
    margin: 10px 0px 10px 0px;
`;

export default class PageViewChooser extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			view: PageView.TEXT
		};
	}

	componentDidMount() {
		this.props.viewChanged(PageView.TEXT);
	}

	buttonCodingEditorClicked() {
		this.setView(PageView.TEXT);
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
		const _this = this;

		const styleSelected = 'btn btn-primary active';
		const styleDefault = 'btn btn-default';
		const classButtonText = _this.state.view == PageView.TEXT ? styleSelected : styleDefault;
		const classButtonUml = _this.state.view == PageView.UML ? styleSelected : styleDefault;

		return (
			<StyledButtonGroup className="btn-group">
				<button type="button" className={classButtonText} onClick={_this.buttonCodingEditorClicked.bind(_this)}>Coding-Editor</button>
		        <button type="button" className={classButtonText} onClick={_this.buttonTextEditorClicked.bind(_this)}>Text-Editor</button>
		        <button type="button" className={classButtonUml} onClick={_this.buttonUmlEditorClicked.bind(_this)}>Uml-Editor</button>
		    </StyledButtonGroup>
		);
	}
}