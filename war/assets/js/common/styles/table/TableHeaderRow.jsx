import React from 'react';
import styled from 'styled-components';

import TableHeaderCell from './TableHeaderCell.jsx';

const StyledTableHeaderRow = styled.tr``;

/**
 * Available props:
 * - columns
 * - sortable
 * - sortColumn
 * - sortMode
 * - sortMode
 * - headerCellSelected: function
 * - renderHeaderCellContent: function
 */
export default class TableHeaderRow extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
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
		return (
			<TableHeaderCell
				column={column}
				columnIndex={index}
				sortable={this.props.sortable}
				isSortColumn={this.props.sortColumn == column}
				sortMode={this.props.sortMode}
				headerCellSelected={this.props.headerCellSelected}
				renderHeaderCellContent={this.props.renderHeaderCellContent}
			/>
		);
	}
}
