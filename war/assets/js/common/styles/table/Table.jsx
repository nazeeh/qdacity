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
`;

const StyledTableBody = styled.tbody`

`;

const StyledTableRow = styled.tr`
	background-color ${props => props.evenIndex ? '#DDECFF' : ''};
`;

const StyledTableCell = styled.td`
	padding: 5px 10px;
`;

/**
 * Available props:
 * - items: specifies the content of the table
 * - renderHeaderRow function which defines how to render the header row in the table
 * - renderRow: function which defines how to render a row in the table
 */
class Table extends React.Component {

	constructor(props) {
		super(props);
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
		if (this.props.renderHeaderRow) {
			return this.props.renderHeaderRow();
		}
		else {
			throw new Error('Please specify a renderHeaderRow method and pass it as a props.')
		}
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

	renderRow(item, index) {
		if (this.props.renderRow) {
			return this.props.renderRow(item, index);
		}
		else {
			throw new Error('Please specify a renderRow method and pass it as a props.')
		}
	}
}

export { Table, StyledTable, StyledTableHead, StyledTableHeaderRow, StyledTableHeaderCell, StyledTableBody, StyledTableRow, StyledTableCell };