import React from 'react';
import styled from 'styled-components';

const StyledTableCell = styled.td`
	padding: 5px 10px;

	background-color: ${props =>
		props.isSelected
			? props.theme.bgPrimaryHighlight
			: !props.evenIndex && props.isSortColumn && props.sortable
				? '#F6F9FF'
				: props.evenIndex && props.isSortColumn && props.sortable
					? '#EFF3F8'
					: ''};

	color: ${props => (props.isSelected ? props.theme.fgPrimaryHighlight : '')};
`;

/**
 * Available props:
 * - item
 * - itemIndex
 * - column
 * - columnIndex
 * - sortable
 * - isSortColumn
 * - isSelected
 * - cellSelected: function
 * - renderCellContent: function
 */
export default class TableCell extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		const content = this.props.renderCellContent
			? this.props.renderCellContent(
				this.props.item,
				this.props.itemIndex,
				this.props.column,
				this.props.columnIndex
			  )
			: '';

		return (
			<StyledTableCell
				evenIndex={(this.props.itemIndex + 1) % 2 == false}
				sortable={this.props.sortable}
				isSortColumn={this.props.isSortColumn}
				isSelected={this.props.isSelected}
				onClick={() =>
					this.props.cellSelected(
						this.props.item,
						this.props.itemIndex,
						this.props.column,
						this.props.columnIndex
					)
				}
			>
				{content}
			</StyledTableCell>
		);
	}
}
