import React from 'react';
import styled from 'styled-components';

const StyledButtonGroup = styled.div `
    display: flex;
    justify-content: center;
    margin: 10px 0px 10px 0px;
`;

const VIEW_TEXT = 'text';
const VIEW_UML = 'uml';

export default class PageViewChooser extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			view: VIEW_TEXT
		};
	}

	buttonTextEditorClicked() {
		this.setView(VIEW_TEXT);
	}

	buttonUmlEditorClicked() {
		this.setView(VIEW_UML);
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
		const classButtonText = _this.state.view == VIEW_TEXT ? styleSelected : styleDefault;
		const classButtonUml = _this.state.view == VIEW_UML ? styleSelected : styleDefault;

		return (
			<StyledButtonGroup className="btn-group">
		        <button type="button" className={classButtonText} onClick={_this.buttonTextEditorClicked.bind(_this)}>Text-Editor</button>
		        <button type="button" className={classButtonUml} onClick={_this.buttonUmlEditorClicked.bind(_this)}>Uml-Editor</button>
		    </StyledButtonGroup>
		);
	}
}