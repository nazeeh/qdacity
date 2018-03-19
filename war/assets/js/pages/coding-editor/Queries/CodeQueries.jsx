import React from 'react';
import styled from 'styled-components';

import cheerio from 'cheerio';

import { PageView } from '../View/PageView.js';

import DocumentParser from './DocumentParser.js';

const StyledContainer = styled.div`
	border-left: 1px solid #888;
	height: 100%;
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
		const _this = this;

		// Render only if the page is code_queries
		if (this.props.selectedEditor != PageView.CODE_QUERIES) {
			return null;
		}

		// Dont render if the code is empty
		if (this.state.code == null) {
			return null;
		}

		// Overlap
		const codingOverlapResult = this.calculateOverlap();

		return (
			<StyledContainer>
				<div>Selected Code: {this.state.code.name}</div>

				<table>
					<thead>
						<th></th>
						<th>Code</th>
						<th>Overlap count</th>
						<th>Average % by {this.state.code.name}</th>
						<th>Average % by the other code</th>
					</thead>
					<tbody>
						{this.getCodeSystemArray().map(code => {
							return _this.renderEntry(code, codingOverlapResult);
						})}
					</tbody>
				</table>

				{ this.renderDetails(codingOverlapResult) }
			</StyledContainer>
		);
	}
	
	renderEntry(code, codingOverlapResult) {
		if (this.state.code.codeID == code.codeID) {
			return null;
		}
		
		const codeKey = code.codeID.toString();
		const codingOverlapCollection = codingOverlapResult.getCodingOverlapCollection(codeKey);

		return (
			<tr>
				<td><div onClick={this.codeSelected.bind(this, code)}>CLICK ME</div></td>
				<td>{code.name}</td>
				<td>{ (codingOverlapCollection) ? codingOverlapCollection.getCodingCount() : '0' }</td>
				<td>{ (codingOverlapCollection) ? codingOverlapCollection.getAverageOverlapPercentageByMainCode() : '0.0' }</td>
				<td>{ (codingOverlapCollection) ? codingOverlapCollection.getAverageOverlapPercentageByOtherCode() : '0.0' }</td>
			</tr>
		);
	}

	renderDetails(codingOverlapResult) {
		if (this.state.selectedCode == null) {
			return null;
		}

		const codeKey = this.state.selectedCode.codeID.toString();
		const codingOverlapCollection = codingOverlapResult.getCodingOverlapCollection(codeKey);

		if (codingOverlapCollection == null) {
			return null;
		}

		return (
			<table>
				<thead>
					<th>#</th>
					<th>Average % by {this.state.code.name}</th>
					<th>Average % by {this.state.selectedCode.name}</th>
				</thead>
				<tbody>
					{codingOverlapCollection.getCodingOverlaps().map((codingOverlap, index) => {
						return (
							<tr>
								<td>{index}</td>
								<td>{codingOverlap.getOverlapPercentageByMainCode()}</td>
								<td>{codingOverlap.getOverlapPercentageByOtherCode()}</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		);
	}
}
