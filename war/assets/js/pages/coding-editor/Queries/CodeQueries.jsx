import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';

import { PageView } from '../View/PageView.js';

import DocumentParser from './data/parser/DocumentParser.js';

import CodeList from './list/CodeList.jsx';
import DetailsView from './details/DetailsView.jsx';

const StyledContainer = styled.div`	
	height: 100%;
	padding: 10px 0px 0px 20px;

	border-left: 1px solid #888;

	display: flex;
	flex-direction: row;
`;

const StyledColumnLeft = styled.div`
	width: 50%;
	min-width: 50%;
	max-width: 50%;
	padding-right: 10px;
`;

const StyledColumnRight = styled.div`
	width: 50%;
	min-width: 50%;
	max-width: 50%;
	padding-left: 10px;
`;

const StyledHeadline = styled.div`
	margin: 10px 0px;
	font-size: 18px;
`;

const StyledHeadlineHighlight = styled.span`
	color: ${props => props.theme.fgPrimary};
	margin-left: 6px;
`;

export default class CodeQueries extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			code: null,
			selectedCode: null
		};

		this.codeSelected = this.codeSelected.bind(this);
	}

	codesystemSelectionChanged(code) {
		this.setState({
			code: code,
			selectedCode: null
		});
	}

	codeSelected(code) {
		this.setState({
			selectedCode: code 
		});
	}

	render() {
		// Render only if the page is code_queries
		if (this.props.selectedEditor != PageView.CODE_QUERIES) {
			return null;
		}

		// Dont render if the code is empty
		if (this.state.code == null) {
			return null;
		}

		// Documents
		const documents = this.props.getDocuments();
		
		// Calculate overlap
		const documentParser = new DocumentParser(this.state.code);
		const codingResult = documentParser.parseDocuments(documents);

		return (
			<StyledContainer>
				{this.renderCodeList(codingResult)}
				{this.renderDetailsView(documents, codingResult)}
			</StyledContainer>
		);
	}

	renderCodeList(codingResult) {
		return (
			<StyledColumnLeft>
				<StyledHeadline>
					<FormattedMessage
						id="codeQueriesHeadlineCodingOverlaps"
						defaultMessage="Coding-Overlaps"
					/>
					<StyledHeadlineHighlight>{this.state.code.name}</StyledHeadlineHighlight>
				</StyledHeadline>

				<CodeList
					code={this.state.code}
					selectedCode={this.state.selectedCode}
					codingResult={codingResult}
					codeSelected={this.codeSelected}
					getCodeSystem={this.props.getCodeSystem}
				/>
			</StyledColumnLeft>
		);
	}

	renderDetailsView(documents, codingResult) {
		return (
			<StyledColumnRight>
				<StyledHeadline>	
					<FormattedMessage
						id="codeQueriesHeadlineDocuments"
						defaultMessage="Documents"
					/>
				</StyledHeadline>

				<DetailsView
					code={this.state.code}
					selectedCode={this.state.selectedCode}
					documents={documents}
					codingResult={codingResult}
					openCodingEditor={this.props.openCodingEditor}
				/>
			</StyledColumnRight>
		);
	}
}
