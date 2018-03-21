import React from 'react';
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
	flex-direction: column;
`;

const StyledContentContainer = styled.div`
	display: flex;
	flex-direction: row;
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
				<div>Selected Code: {this.state.code.name}</div>

				<StyledContentContainer>
					<CodeList
						code={this.state.code}
						selectedCode={this.state.selectedCode}
						codingResult={codingResult}
						codeSelected={this.codeSelected}
						getCodeSystem={this.props.getCodeSystem}
					/>

					<DetailsView
						code={this.state.code}
						selectedCode={this.state.selectedCode}
						documents={documents}
						codingResult={codingResult}
					/>
				</StyledContentContainer>
			</StyledContainer>
		);
	}
}
