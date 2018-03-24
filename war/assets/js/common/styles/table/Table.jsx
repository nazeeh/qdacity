import React from 'react';
import styled from 'styled-components';

const StyledTable = styled.table`
	border-collapse: collapse;
	border: 1px solid;
	border-color: ${props => props.theme.borderDefault};
`;

const StyledTableHead = styled.thead`
	border-bottom: 1px solid;
	border-color: ${props => props.theme.borderDefault};
`;

const StyledTableHeaderRow = styled.tr`
`;

const StyledTableHeaderCell = styled.th`
	padding: 5px 10px;
	font-weight: normal;
	color: ${props => props.sortColumn ? props.theme.fgPrimary : ''};
`;

const StyledTableBody = styled.tbody`
`;

const StyledTableRow = styled.tr`
	background-color: ${props => props.evenIndex ? '#efefef' : ''};
`;

const StyledTableCell = styled.td`
	padding: 5px 10px;
	background-color: ${props => !props.evenIndex && props.sortColumn ? '#F0F6FF' : (props.evenIndex && props.sortColumn ? '#E8EFF7' : '')};
`;

/**
 * Available props:
 * - columns:
 * - items: specifies the content of the table
 * - defaultSortColumn
 * - renderHeaderCellContent
 * - renderCellContent
 */
class Table extends React.Component {

	constructor(props) {
		super(props);

		let defaultSortColumn = null;

		if (this.props.defaultSortColumn) {
			defaultSortColumn = this.props.defaultSortColumn;
		}
		else if (this.props.columns && this.props.columns.length > 0) {
			defaultSortColumn = this.props.columns[0];
		}
		else {
			throw new Error('No columns specified.');
		}

		this.state = {
			sortColumn: defaultSortColumn
		};
	}

	render() {
		return (
			<StyledTable>
				{this.renderHeader()}

				{this.renderBody()}
			</StyledTable>
		);
	}

	renderHeader() {
		return (
			<StyledTableHead>
				{this.renderHeaderRow()}
			</StyledTableHead>
		);
	}

	renderHeaderRow() {
		const _this = this;

		return (
			<StyledTableHeaderRow>
				{this.props.columns.map((column, index) => {
					return _this.renderHeaderCell(column, index);
				})}
			</StyledTableHeaderRow>
		);
	}

	renderHeaderCell(column, index) {
		const content = this.props.renderHeaderCellContent ? this.props.renderHeaderCellContent(column, index) : '';

		return (
			<StyledTableHeaderCell sortColumn={this.state.sortColumn == column}>{content}</StyledTableHeaderCell>
		);
	}

	renderBody() {
		const _this = this;

		const items = this.props.items;

		return (
			<StyledTableBody>
				{items.map((item, index) => {
					return _this.renderRow(item, index);
				})}
			</StyledTableBody>
		);
	}

	renderRow(item, itemIndex) {
		const _this = this;

		return (
			<StyledTableRow evenIndex={((itemIndex + 1) % 2) == false}>
				{this.props.columns.map((column, columnIndex) => {
					return _this.renderCell(item, itemIndex, column, columnIndex);
				})}
			</StyledTableRow>
		);
	}

	renderCell(item, itemIndex, column, columnIndex) {
		const content = this.props.renderCellContent ? this.props.renderCellContent(item, itemIndex, column, columnIndex) : '';

		return (
			<StyledTableCell
				evenIndex={((itemIndex + 1) % 2) == false}
				sortColumn={this.state.sortColumn == column}
			>{content}</StyledTableCell>
		);
	}
}

export { Table, StyledTable, StyledTableHead, StyledTableHeaderRow, StyledTableHeaderCell, StyledTableBody, StyledTableRow, StyledTableCell };