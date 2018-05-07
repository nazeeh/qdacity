import React from 'react';
import styled from 'styled-components';

import { SortMode } from './SortMode.js';
import TableHeaderRow from './TableHeaderRow.jsx';
import TableHeaderCell from './TableHeaderCell.jsx';
import TableRow from './TableRow.jsx';
import TableCell from './TableCell.jsx';

const StyledTable = styled.table`
	border-collapse: collapse;
	border: 1px solid;
	border-color: ${props => props.theme.borderDefault};
	width: ${props => (props.useAvailableWidth ? '100%' : '')};
`;

const StyledTableHead = styled.thead`
	border-bottom: 1px solid;
	border-color: ${props => props.theme.borderDefault};
`;

const StyledTableBody = styled.tbody``;

/**
 * Available props:
 * - items: the items which will be rendered as rows
 * - columns: specifies the available columns
 * - useAvailableWidth: should the table use the available width (100%)?
 * - sortable: is the table sortable?
 * - selectable: is the table selectable?
 * - defaultSortColumn: the default (on load) sort column
 * - defaultSortMode: the default (on load) sort mode (ascending or descending)
 * - fallbackSortMode: when sorting by another column, this value will initially be used for the sort mode (ascending or descending)
 * - cellSelected: function - called when a cell is selected
 * - getSortFunction: function - returns the sort function, depending on the selected column
 * - renderHeaderCellContent: function - renders the header cell content
 * - renderCellContent: function - renders the cell content
 */
export default class Table extends React.Component {
	constructor(props) {
		super(props);

		// Default sort column
		let defaultSortColumn = null;

		if (this.props.defaultSortColumn) {
			defaultSortColumn = this.props.defaultSortColumn;
		} else if (this.props.columns && this.props.columns.length > 0) {
			defaultSortColumn = this.props.columns[0];
		} else {
			throw new Error('No columns specified.');
		}

		// Default sort mode
		const defaultSortMode = this.props.defaultSortMode
			? this.props.defaultSortMode
			: this.props.fallbackSortMode;

		// Fallback sort mode
		if (!this.props.fallbackSortMode) {
			this.props.fallbackSortMode = SortMode.DESCENDING;
		}

		this.state = {
			sortColumn: defaultSortColumn,
			sortMode: defaultSortMode,
			selectedItem: null
		};

		this.headerCellSelected = this.headerCellSelected.bind(this);
		this.cellSelected = this.cellSelected.bind(this);
	}

	headerCellSelected(column, index) {
		if (!this.props.sortable) {
			return;
		}

		// Sort mode
		let newSortMode = null;
		if (this.state.sortColumn != column) {
			newSortMode = this.props.fallbackSortMode;
		} else {
			if (this.state.sortMode == SortMode.ASCENDING) {
				newSortMode = SortMode.DESCENDING;
			} else if (this.state.sortMode == SortMode.DESCENDING) {
				newSortMode = SortMode.ASCENDING;
			} else {
				throw new Error('Case not implemented: ' + this.state.sortMode);
			}
		}

		this.setState({
			sortColumn: column,
			sortMode: newSortMode
		});
	}

	cellSelected(item, itemIndex, column, columnIndex) {
		if (!this.props.selectable) {
			return;
		}

		this.setState(
			{
				selectedItem: item
			},
			() => {
				if (this.props.cellSelected) {
					this.props.cellSelected(item, itemIndex, column, columnIndex);
				}
			}
		);
	}

	render() {
		return (
			<StyledTable useAvailableWidth={this.props.useAvailableWidth}>
				{this.renderHeader()}

				{this.renderBody()}
			</StyledTable>
		);
	}

	renderHeader() {
		return <StyledTableHead>{this.renderHeaderRow()}</StyledTableHead>;
	}

	renderHeaderRow() {
		return (
			<TableHeaderRow
				sortable={this.props.sortable}
				sortColumn={this.state.sortColumn}
				sortMode={this.state.sortMode}
				columns={this.props.columns}
				headerCellSelected={this.headerCellSelected}
				renderHeaderCellContent={this.props.renderHeaderCellContent}
			/>
		);
	}

	renderBody() {
		const _this = this;

		const items = this.props.items;

		// Sort items
		if (this.props.sortable) {
			const sortFunction = this.props.getSortFunction
				? this.props.getSortFunction(this.state.sortColumn, this.state.sortMode)
				: null;
			items.sort(sortFunction, this.state.sortMode);
		}

		return (
			<StyledTableBody>
				{items.map((item, index) => {
					return _this.renderRow(item, index);
				})}
			</StyledTableBody>
		);
	}

	renderRow(item, itemIndex) {
		return (
			<TableRow
				item={item}
				itemIndex={itemIndex}
				sortable={this.props.sortable}
				sortColumn={this.state.sortColumn}
				selectable={this.props.selectable}
				isSelected={this.state.selectedItem == item}
				columns={this.props.columns}
				cellSelected={this.cellSelected}
				renderCellContent={this.props.renderCellContent}
			/>
		);
	}
}
