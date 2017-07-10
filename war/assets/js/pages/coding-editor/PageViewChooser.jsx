import React from 'react';
import styled from 'styled-components';

const StyledButtonGroup = styled.div `
    display: flex;
    justify-content: center;
    margin: 10px 0px 10px 0px;
`;

export default class PageViewChooser extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			view: 'text'
		};
	}

	buttonTextEditorClicked() {
		this.setState({
			view: 'text'
		});
	}

	buttonUmlEditorClicked() {
		this.setState({
			view: 'uml'
		});
	}

	render() {
		const _this = this;

		const styleSelected = 'btn btn-primary active';
		const styleDefault = 'btn btn-default';
		const classButtonText = _this.state.view == 'text' ? styleSelected : styleDefault;
		const classButtonUml = _this.state.view == 'uml' ? styleSelected : styleDefault;

		return (
			<StyledButtonGroup className="btn-group">
		        <button type="button" className={classButtonText} onClick={_this.buttonTextEditorClicked.bind(_this)}>Text-Editor</button>
		        <button type="button" className={classButtonUml} onClick={_this.buttonUmlEditorClicked.bind(_this)}>Uml-Editor</button>
		    </StyledButtonGroup>
		);
	}
}