import React from 'react';
import styled from 'styled-components';

import TableCell from './TableCell.jsx';

const StyledTableRow = styled.tr`
	background-color: ${props => (props.evenIndex ? '#efefef' : '')};

	&:hover {
		background-color: ${props =>
		props.selectable && !props.isSelected
			? props.theme.bgHover + ' !important'
			: ''};
		color: ${props =>
		props.selectable && !props.isSelected ? props.theme.fgDefault : ''};
		cursor: ${props => (props.selectable ? 'pointer' : '')};
	}

	&:hover > td {
		background-color: ${props =>
		props.selectable && !props.isSelected ? 'transparent !important' : ''};
	}
`;

/**
 * Available props:
 * - item
 * - itemIndex
 * - sortable
 * - sortColumn
 * - selectable
 * - isSelected
 * - columns
 * - cellSelected: function
 * - renderCellContent: function
 */
export default class TableRow extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		const _this = this;

		return (
			<StyledTableRow
				evenIndex={(this.props.itemIndex + 1) % 2 == false}
				selectable={this.props.selectable}
				isSelected={this.props.isSelected}
			>
				{this.props.columns.map((column, columnIndex) => {
					return _this.renderCell(column, columnIndex);
				})}
			</StyledTableRow>
		);
	}

	renderCell(column, columnIndex) {
		return (
			<TableCell
				item={this.props.item}
				itemIndex={this.props.itemIndex}
				column={column}
				columnIndex={columnIndex}
				sortable={this.props.sortable}
				isSortColumn={this.props.sortColumn == column}
				isSelected={this.props.isSelected}
				cellSelected={this.props.cellSelected}
				renderCellContent={this.props.renderCellContent}
			/>
		);
	}
}
