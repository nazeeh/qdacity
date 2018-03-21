import React from 'react';
import styled from 'styled-components';

const StyledCodeListContainer = styled.div`
	flex: 50%;
`;

export default class CodeList extends React.Component {

	constructor(props) {
		super(props);
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

		const codes = this.getCodeSystemArray();
		this.sortCodes(codes);

		return (
			<StyledCodeListContainer>
				<table style={{ borderSpacing: '5px', borderCollapse: 'separate' }}>
					<thead>
						<th></th>
						<th>Code</th>
						<th>Overlaps by {this.props.code.name}</th>
						<th>Overlaps by other code</th>
						<th>Average % by {this.props.code.name}</th>
						<th>Average % by other code</th>
					</thead>
					<tbody>
						{codes.map(code => {
							return _this.renderListItem(code);
						})}
					</tbody>
				</table>
			</StyledCodeListContainer>
		);
	}
	
	renderListItem(code) {
		if (this.props.code.codeID == code.codeID) {
			return null;
		}
		
		return (
			<tr>
				<td><div onClick={() => this.props.codeSelected(code)}>X</div></td>
				<td>{code.name}</td>
				<td>{this.props.codingResult.getCodingOverlapCount(code.codeID)} by {this.props.codingResult.getTotalCodingsCountMainCode()}</td>
				<td>{this.props.codingResult.getCodingOverlapCount(code.codeID)} by {this.props.codingResult.getTotalCodingsCount(code.codeID)}</td>
				<td>{this.props.codingResult.getAverageOverlapPercentageByMainCode(code.codeID).toFixed(2)}</td>
				<td>{this.props.codingResult.getAverageOverlapPercentageByOtherCode(code.codeID).toFixed(2)}</td>
			</tr>
		);
	}
}
