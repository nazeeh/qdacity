import React from 'react';
import styled from 'styled-components';

const StyledTable = styled.div`
	display: grid;
	grid-template-columns: 1fr;
	grid-template-areas:
		'tableHeader'
		'tableContent';
`;

const StyledTableHeader = styled.div`
	display: grid;
	grid-area: tableHeader;
	grid-template-columns: ${props => props.columns};
	border-bottom: 2px solid;
	border-color: ${props => props.theme.borderDefaultHighlight};
	width: 100%;
	font-weight: bold;
	font-size: 1.1em;
	padding: 5px;
`;

const StyledTableContent = styled.div`
	grid-area: tableContent;
`;

const StyledTableRow = styled.div`
	display: grid;
	grid-template-columns: ${props => props.columns};
	border-bottom: 1px solid;
	border-color: ${props => props.theme.borderDefault};
	padding: 2px 0px 2px 0px;
	cursor: pointer;
`;

const StyledTableHeaderElement = styled.div``;

export default class Table extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		const _this = this;
		return (
			<StyledTable>
				<StyledTableHeader columns={this.props.columns}>
					{this.props.tableHeader.map(function(headerElement) {
						return <div>{headerElement}</div>;
					})}
				</StyledTableHeader>
				<StyledTableContent columns={this.props.columns}>
					{this.props.tableContent.map(function(content) {
						return (
							<StyledTableRow
								columns={_this.props.columns}
								onClick={content.onClick}
							>
								{content.row.map(tableCell => {
									return <div>{tableCell}</div>;
								})}
							</StyledTableRow>
						);
					})}
				</StyledTableContent>
			</StyledTable>
		);
	}
}
