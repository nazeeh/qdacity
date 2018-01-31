import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';

import CodesEndpoint from '../../../common/endpoints/CodesEndpoint';

import { BtnDefault } from '../../../common/styles/Btn.jsx';

const StyledCodeviewComponent = styled.div`
	padding: 8px 3px 0px 3px;
`;

const StyledEntry = styled.div`
	padding: 0 5px 0 5px;
`;

const StyledTextField = styled.textarea`
	height: 200px;
	width: 100%;
	background-color: #fff;
	resize: none;
`;

const StyledSaveBtn = styled.div`
	text-align: center;
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
		this.props.code.codeBookEntry.whenNotToUse = this.addDiv(
			event.target.value
		);
		this.forceUpdate();
	}

	updateCodeBookEntry() {
		var _this = this;
		CodesEndpoint.setCodeBookEntry(
			this.props.code.id,
			this.props.code.codeBookEntry
		).then(function(resp) {
			_this.props.updateSelectedCode(resp);
		});
	}

	removeDiv(str) {
		if (!str.startsWith('<div>')) return str;
		return str.substring(5, str.length - 6);
	}

	addDiv(str) {
		return '<div>' + str + '</div>';
	}

	render() {
		return (
			<StyledCodeviewComponent>
				<StyledEntry className="col-sm-4">
					<span className="codebookEntryCol">
						<FormattedMessage
							id="codebookentry.definition"
							defaultMessage="Definition"
						/>
					</span>
					<StyledTextField
						value={this.removeDiv(this.props.code.codeBookEntry.definition)}
						onChange={this.changeDef}
					/>
				</StyledEntry>
				<StyledEntry className="col-sm-4">
					<span className="codebookEntryCol">
						<FormattedMessage
							id="codebookentry.when_to_use"
							defaultMessage="When To Use"
						/>
					</span>
					<StyledTextField
						value={this.removeDiv(this.props.code.codeBookEntry.whenToUse)}
						onChange={this.changeWhen}
					/>
				</StyledEntry>
				<StyledEntry className="col-sm-4">
					<span className="codebookEntryCol">
						<FormattedMessage
							id="codebookentry.when_not_to_use"
							defaultMessage="When Not To Use"
						/>
					</span>
					<StyledTextField
						value={this.removeDiv(this.props.code.codeBookEntry.whenNotToUse)}
						onChange={this.changeWhenNot}
					/>
				</StyledEntry>
				<StyledSaveBtn>
					<BtnDefault onClick={() => this.updateCodeBookEntry()}>
						<i className="fa fa-floppy-o " />
						<span>
							<FormattedMessage id="codebookentry.save" defaultMessage="Save" />
						</span>
					</BtnDefault>
				</StyledSaveBtn>
			</StyledCodeviewComponent>
		);
	}
}
