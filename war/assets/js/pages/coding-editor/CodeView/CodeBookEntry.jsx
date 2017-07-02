import React from 'react'
import styled from 'styled-components';

import CodesEndpoint from '../../../common/endpoints/CodesEndpoint';

const StyledCodeviewComponent = styled.div `
    padding: 8px 3px 0px 3px;
`;

const StyledEntry = styled.div `
    padding: 0 5px 0 5px;
`;

const StyledTextField = styled.textarea `
    height:200px;
	width: 100%;
	background-color: #FFF;
	resize: none;
`;

const StyledSaveBtn = styled.div `
    width: 8em;
	text-align: center;
	margin: 0 auto;
`;

export default class codeBookEntry extends React.Component {
	constructor(props) {
		super(props);
		this.changeDef = this.changeDef.bind(this);
		this.changeWhen = this.changeWhen.bind(this);
		this.changeWhenNot = this.changeWhenNot.bind(this);
	}

	changeDef(event) {
		this.props.code.codeBookEntry.definition = this.addDiv(event.target.value);
		this.forceUpdate();
	}

	changeWhen(event) {
		this.props.code.codeBookEntry.whenToUse = this.addDiv(event.target.value);
		this.forceUpdate();
	}

	changeWhenNot(event) {
		this.props.code.codeBookEntry.whenNotToUse = this.addDiv(event.target.value);
		this.forceUpdate();
	}

	updateCodeBookEntry() {
		var _this = this;
		CodesEndpoint.setCodeBookEntry(this.props.code.id, this.props.code.codeBookEntry).then(function (resp) {
			_this.props.updateSelectedCode(resp);
		});
	}

	removeDiv(str) {
		if (!str.startsWith("<div>")) return str;
		return str.substring(5, str.length - 6);
	}

	addDiv(str) {
		return "<div>" + str + "</div>";
	}


	render() {
		return (
			<StyledCodeviewComponent>
				<StyledEntry className="col-sm-4">
					<span className="codebookEntryCol">Definition</span>
					<StyledTextField value={this.removeDiv(this.props.code.codeBookEntry.definition)} onChange={this.changeDef} />
				</StyledEntry>
				<StyledEntry className="col-sm-4">
					<span className="codebookEntryCol">When To Use</span>
					<StyledTextField value={this.removeDiv(this.props.code.codeBookEntry.whenToUse)} onChange={this.changeWhen} />
				</StyledEntry>
				<StyledEntry className="col-sm-4">
					<span className="codebookEntryCol">When Not To Use</span>
					<StyledTextField value={this.removeDiv(this.props.code.codeBookEntry.whenNotToUse)} onChange={this.changeWhenNot} />
				</StyledEntry>
				<StyledSaveBtn >
					<a className="btn btn-default btn-default" onClick={() => this.updateCodeBookEntry()} >
						<i className="fa fa-floppy-o "></i>
						Save
					</a>
				</StyledSaveBtn>
			</StyledCodeviewComponent>
		);
	}
}