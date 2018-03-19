import React from 'react';
import styled from 'styled-components';

import cheerio from 'cheerio';

import { PageView } from '../View/PageView.js';

import DocumentParser from './parser/DocumentParser.js';

const StyledContainer = styled.div`
	border-left: 1px solid #888;
	height: 100%;
	padding: 10px 20px;
`;

const StyledContentContainer = styled.div`
	display: flex;
	flex-direction: row;
`;

const StyledCodeListContainer = styled.div`
	flex: 50%;
`;

const StyledDetailsContainer = styled.div`
	flex: 50%;
`;

export default class CodeQueries extends React.Component {

	constructor(props) {
		super(props);

		this.documentParser = new DocumentParser();

		this.state = {
			code: null,
			selectedCode: null
		};
	}

	codesystemSelectionChanged(code) {
		this.setState({
			code: code,
			selectedCode: null
		});
	}

	getCodeSystemArray() {
		let codes = [];

		let createSimpleArray = code => {
			codes.push(code);

			if (code.children) {
				code.children.forEach(createSimpleArray);
			}
		};

		this.props.getCodeSystem().forEach(createSimpleArray);

		return codes;
	}

	calculateOverlap() {		
		let documents = this.props.getDocuments();
		
		return this.documentParser.parseDocuments(this.state.code, documents);
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

		// Calculate overlap
		const codingOverlapResult = this.calculateOverlap();
		
		return (
			<StyledContainer>
				<div>Selected Code: {this.state.code.name}</div>

				<StyledContentContainer>
					{ this.renderCodeList(codingOverlapResult) }

					{ this.renderDetails(codingOverlapResult) }
				</StyledContentContainer>
			</StyledContainer>
		);
	}

	renderCodeList(codingOverlapResult) {
		const _this = this;

		// Sort codes
		const codes = this.getCodeSystemArray();
		codes.sort((code1, code2) => {
			const codingOverlapCollection1 = codingOverlapResult.getCodingOverlapCollection(code1.codeID.toString());
			const codingOverlapCollection2 = codingOverlapResult.getCodingOverlapCollection(code2.codeID.toString());
			const codingCount1 = (codingOverlapCollection1) ? codingOverlapCollection1.getCodingCount() : 0;
			const codingCount2 = (codingOverlapCollection2) ? codingOverlapCollection2.getCodingCount() : 0;

			// Sort by coding count
			if (codingCount1 > codingCount2) return -1;
			if (codingCount1 < codingCount2) return 1;

			// Sort by name
			if(code1.name < code2.name) return -1;
			if(code1.name > code2.name) return 1;

			return 0;
		});

		return (
			<StyledCodeListContainer>
				<table style={{ borderSpacing: '10px', borderCollapse: 'separate' }}>
					<thead>
						<th></th>
						<th>Code</th>
						<th>Overlap count</th>
						<th>Average % by {this.state.code.name}</th>
						<th>Average % by the other code</th>
					</thead>
					<tbody>
						{codes.map(code => {
							return _this.renderCodeListItem(code, codingOverlapResult);
						})}
					</tbody>
				</table>
			</StyledCodeListContainer>
		);
	}
	
	renderCodeListItem(code, codingOverlapResult) {
		if (this.state.code.codeID == code.codeID) {
			return null;
		}
		
		const codingOverlapCollection = codingOverlapResult.getCodingOverlapCollection(code.codeID.toString());

		return (
			<tr>
				<td><div onClick={this.codeSelected.bind(this, code)}>CLICK ME</div></td>
				<td>{code.name}</td>
				<td>{ (codingOverlapCollection) ? codingOverlapCollection.getCodingCount() : '0' }</td>
				<td>{ (codingOverlapCollection) ? codingOverlapCollection.getAverageOverlapPercentageByMainCode().toFixed(2) : '0.00' }</td>
				<td>{ (codingOverlapCollection) ? codingOverlapCollection.getAverageOverlapPercentageByOtherCode().toFixed(2): '0.00' }</td>
			</tr>
		);
	}

	renderDetails(codingOverlapResult) {
		const _this = this;

		if (this.state.selectedCode == null) {
			return null;
		}

		const codingOverlapCollection = codingOverlapResult.getCodingOverlapCollection(this.state.selectedCode.codeID.toString());

		if (codingOverlapCollection == null) {
			return null;
		}

		return (
			<StyledDetailsContainer>
				<table style={{ borderSpacing: '10px', borderCollapse: 'separate' }}>
					<thead>
						<th>#</th>
						<th>Document</th>
						<th>% by {this.state.code.name}</th>
						<th>% by {this.state.selectedCode.name}</th>
					</thead>
					<tbody>
						{codingOverlapCollection.getCodingOverlaps().map((codingOverlap, index) => {
							return _this.renderDetailsItem(codingOverlap, index);
						})}
					</tbody>
				</table>
			</StyledDetailsContainer>
		);
	}

	renderDetailsItem(codingOverlap, index) {
		return (
			<tr>
				<td>{index + 1}</td>
				<td>{codingOverlap.getDocument().title}</td>
				<td>{codingOverlap.getOverlapPercentageByMainCode().toFixed(2)}</td>
				<td>{codingOverlap.getOverlapPercentageByOtherCode().toFixed(2)}</td>
			</tr>
		);
	}
}
