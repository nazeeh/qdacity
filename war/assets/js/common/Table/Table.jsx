import React from 'react'
import styled from 'styled-components';


const StyledTable = styled.div `
	padding-top: 51px;
	display: grid;
	grid-template-columns: 3fr 14fr;
	grid-template-areas:
		"tableHeader"
		"tableContent";
`;

const StyledTableHeader = styled.div `
	grid-area: tableHeader;
`;

export default class Table extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		};
	}


	render(){
		return(
			<StyledTable>
				<StyledTableHeader>
					{
						this.props.tableHeader.map(function(headerElement) {
						  return tableHeader;
						})
					}
				</StyledTableHeader>
			</StyledTable>
		);
	}
}