import React from 'react';
import styled from 'styled-components';

import { Table, StyledTableHeaderRow, StyledTableHeaderCell, StyledTableRow, StyledTableCell } from '../../../../common/styles/table/Table.jsx';

const StyledCodeListContainer = styled.div`
	flex: 50%;
	max-width: 50%;
	padding-right: 10px;
`;

export default class CodeList extends React.Component {

	constructor(props) {
		super(props);

		this.renderHeaderRow = this.renderHeaderRow.bind(this);
		this.renderRow = this.renderRow.bind(this);
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

	sortCodes(codes) {
		const _this = this;

		codes.sort((code1, code2) => {
			const codingCount1 = _this.props.codingResult.getCodingOverlapCount(code1.codeID);
			const codingCount2 = _this.props.codingResult.getCodingOverlapCount(code2.codeID);

			// Sort by coding count
			if (codingCount1 > codingCount2) return -1;
			if (codingCount1 < codingCount2) return 1;

			// Sort by name
			if(code1.name < code2.name) return -1;
			if(code1.name > code2.name) return 1;

			return 0;
		});
	}

	render() {
		const _this = this;

		// Get codes
		let codes = this.getCodeSystemArray();

		// Filter main code
		codes = codes.filter((code) => {
			return this.props.code.codeID != code.codeID;
		});

		// Sort codes
		this.sortCodes(codes);

		return (
			<StyledCodeListContainer>
				<Table 
					items={codes} 
					renderHeaderRow={this.renderHeaderRow}
					renderRow={this.renderRow} 
				/>
			</StyledCodeListContainer>
		);
	}
	
	renderHeaderRow() {
		return (
			<StyledTableHeaderRow>
				<StyledTableHeaderCell>#</StyledTableHeaderCell>
				<StyledTableHeaderCell></StyledTableHeaderCell>
				<StyledTableHeaderCell>Code</StyledTableHeaderCell>
				<StyledTableHeaderCell>Overlaps by {this.props.code.name}</StyledTableHeaderCell>
				<StyledTableHeaderCell>Overlaps by other code</StyledTableHeaderCell>
				<StyledTableHeaderCell>Average % by {this.props.code.name}</StyledTableHeaderCell>
				<StyledTableHeaderCell>Average % by other code</StyledTableHeaderCell>
			</StyledTableHeaderRow>
		);
	}

	renderRow(code, index) {
		return (
			<StyledTableRow evenIndex={((index + 1) % 2) == false}>
				<StyledTableCell>{index}</StyledTableCell>
				<StyledTableCell><div onClick={() => this.props.codeSelected(code)}>X</div></StyledTableCell>
				<StyledTableCell>{code.name}</StyledTableCell>
				<StyledTableCell>{this.props.codingResult.getCodingOverlapCount(code.codeID)} by {this.props.codingResult.getTotalCodingsCountMainCode()}</StyledTableCell>
				<StyledTableCell>{this.props.codingResult.getCodingOverlapCount(code.codeID)} by {this.props.codingResult.getTotalCodingsCount(code.codeID)}</StyledTableCell>
				<StyledTableCell>{this.props.codingResult.getAverageOverlapPercentageByMainCode(code.codeID).toFixed(2)}</StyledTableCell>
				<StyledTableCell>{this.props.codingResult.getAverageOverlapPercentageByOtherCode(code.codeID).toFixed(2)}</StyledTableCell>
			</StyledTableRow>
		);
	}
}
