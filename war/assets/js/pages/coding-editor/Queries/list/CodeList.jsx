import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';

import { SortMode } from '../../../../common/styles/table/SortMode.js';
import Table from '../../../../common/styles/table/Table.jsx';

const TABLE_COLUMN_CODE = 'code';
const TABLE_COLUMN_OVERLAPS_MAIN = 'overlaps-main';
const TABLE_COLUMN_OVERLAPS_OTHER = 'overlaps-other';
const TABLE_COLUMN_AVERAGE_PERCENTAGE_MAIN = 'average-percentage-main';
const TABLE_COLUMN_AVERAGE_PERCENTAGE_OTHER = 'average-percentage-other';

export default class CodeList extends React.Component {

	constructor(props) {
		super(props);

		this.getSortFunction = this.getSortFunction.bind(this);
		this.cellSelected = this.cellSelected.bind(this);
		this.renderHeaderCellContent = this.renderHeaderCellContent.bind(this);
		this.renderCellContent = this.renderCellContent.bind(this);
	}

	cellSelected(item, itemIndex, column, columnIndex) {
		this.props.codeSelected(item);
	}

	getSortFunction(column, sortMode) {
		const _this = this;

		const sortByValue = (value1, value2) => {
			if (sortMode == SortMode.ASCENDING) {
				if (value1 < value2) return -1;
				if (value1 > value2) return 1;
			}
			else if (sortMode == SortMode.DESCENDING) {
				if (value2 < value1) return -1;
				if (value2 > value1) return 1;
			}
			else {
				throw new Error('Case not implemented: ' + sortMode);
			}

			return 0;
		};

		const sortByName = (code1, code2) => {
			return sortByValue(code1.name, code2.name);
		};

		const sortByOverlapCount = (code1, code2) => {
			const codingCount1 = _this.props.codingResult.getCodingOverlapCount(code1.codeID);
			const codingCount2 = _this.props.codingResult.getCodingOverlapCount(code2.codeID);
			
			const result = sortByValue(codingCount1, codingCount2);

			return result != 0 ? result : sortByName(code1, code2);
		};
		
		const sortByAveragePercentageByMainCode = (code1, code2) => {
			const averagePercentageCode1 = _this.props.codingResult.getAverageOverlapPercentageByMainCode(code1.codeID);
			const averagePercentageCode2 = _this.props.codingResult.getAverageOverlapPercentageByMainCode(code2.codeID);

			const result = sortByValue(averagePercentageCode1, averagePercentageCode2);

			return result != 0 ? result : sortByName(code1, code2);
		};

		const sortByAveragePercentageByOtherCode = (code1, code2) => {
			const averagePercentageCode1 = _this.props.codingResult.getAverageOverlapPercentageByOtherCode(code1.codeID);
			const averagePercentageCode2 = _this.props.codingResult.getAverageOverlapPercentageByOtherCode(code2.codeID);

			const result = sortByValue(averagePercentageCode1, averagePercentageCode2);

			return result != 0 ? result : sortByName(code1, code2);
		};

		switch (column) {
			case TABLE_COLUMN_CODE: {
				return sortByName;
			}
			case TABLE_COLUMN_OVERLAPS_MAIN: {
				return sortByOverlapCount;
			}
			case TABLE_COLUMN_OVERLAPS_OTHER: {
				return sortByOverlapCount;
			}
			case TABLE_COLUMN_AVERAGE_PERCENTAGE_MAIN: {
				return sortByAveragePercentageByMainCode;
			}
			case TABLE_COLUMN_AVERAGE_PERCENTAGE_OTHER: {
				return sortByAveragePercentageByOtherCode;
			}
			default: {
				throw new Error('Missing case in switch statement: ' + column);
			}
		}
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

	render() {
		const _this = this;

		// Get codes
		let codes = this.getCodeSystemArray();

		// Filter main code
		codes = codes.filter((code) => {
			return this.props.code.codeID != code.codeID;
		});

		return (
			<Table 
				items={codes} 
				columns={[
					TABLE_COLUMN_CODE, 
					TABLE_COLUMN_OVERLAPS_MAIN, 
					TABLE_COLUMN_OVERLAPS_OTHER, 
					TABLE_COLUMN_AVERAGE_PERCENTAGE_MAIN, 
					TABLE_COLUMN_AVERAGE_PERCENTAGE_OTHER
				]}
				useAvailableWidth={true}
				selectable={true}
				sortable={true}
				defaultSortColumn={TABLE_COLUMN_OVERLAPS_MAIN}
				defaultSortMode={SortMode.DESCENDING}
				fallbackSortMode={SortMode.DESCENDING}
				cellSelected={this.cellSelected}
				getSortFunction={this.getSortFunction}
				renderHeaderCellContent={this.renderHeaderCellContent}
				renderCellContent={this.renderCellContent} 
			/>
		);
	}

	renderHeaderCellContent(column, columnIndex) {
		switch (column) {
			case TABLE_COLUMN_CODE: {
				return (
					<FormattedMessage
						id="codeQueriesCodeListHeaderCode"
						defaultMessage="Code"
					/>
				);
			}
			case TABLE_COLUMN_OVERLAPS_MAIN: {
				return [
					<FormattedMessage
						id="codeQueriesCodeListHeaderOverlapsBy"
						defaultMessage="Overlaps by"
					/>, 
					<br/>, 
					this.props.code.name
				];
			}
			case TABLE_COLUMN_OVERLAPS_OTHER: {
				return [
					<FormattedMessage
						id="codeQueriesCodeListHeaderOverlapsBy"
						defaultMessage="Overlaps by"
					/>, 
					<br/>, 
					<FormattedMessage
						id="codeQueriesCodeListHeaderOtherCode"
						defaultMessage="other code"
					/>
				];
			}
			case TABLE_COLUMN_AVERAGE_PERCENTAGE_MAIN: {
				return [
					<FormattedMessage
						id="codeQueriesCodeListHeaderOverlapPercentageBy"
						defaultMessage="Overlap % by"
					/>, 
					<br/>, 
					this.props.code.name
				];
			}
			case TABLE_COLUMN_AVERAGE_PERCENTAGE_OTHER: {
				return [
					<FormattedMessage
						id="codeQueriesCodeListHeaderOverlapPercentageBy"
						defaultMessage="Overlap % by"
					/>,
					 <br/>, 
					<FormattedMessage
						id="codeQueriesCodeListHeaderOtherCode"
						defaultMessage="other code"
					/>
				];
			}
			default: {
				throw new Error('Missing case in switch statement: ' + column);
			}
		}
	}

	renderCellContent(code, itemIndex, column, columnIndex) {
		switch (column) {
			case TABLE_COLUMN_CODE: {
				return code.name;
			}
			case TABLE_COLUMN_OVERLAPS_MAIN: {
				return this.props.codingResult.getCodingOverlapCount(code.codeID) + ' / ' + this.props.codingResult.getTotalCodingsCountMainCode();
			}
			case TABLE_COLUMN_OVERLAPS_OTHER: {
				return this.props.codingResult.getCodingOverlapCount(code.codeID) + ' / ' + this.props.codingResult.getTotalCodingsCount(code.codeID);
			}
			case TABLE_COLUMN_AVERAGE_PERCENTAGE_MAIN: {
				const value = this.props.codingResult.getAverageOverlapPercentageByMainCode(code.codeID);
				return (value > 0.0 ? (value * 100).toFixed(2) + ' %' : '-');
			}
			case TABLE_COLUMN_AVERAGE_PERCENTAGE_OTHER: {
				const value = this.props.codingResult.getAverageOverlapPercentageByOtherCode(code.codeID);
				return (value > 0.0 ? (value * 100).toFixed(2) + ' %' : '-');
			}
			default: {
				throw new Error('Missing case in switch statement: ' + column);
			}
		}
	}
}
