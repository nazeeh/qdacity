import React from 'react'
import styled from 'styled-components';


const StyledTable = styled.div `
	display: grid;
	grid-template-columns:  1fr;
	grid-template-areas:
		"tableHeader"
		"tableContent";
`;

const StyledTableHeader = styled.div `
	display: grid;
	grid-area: tableHeader;
	grid-template-columns:  ${props => props.columns};
	width: 100%;
`;

const StyledTableHeaderElement = styled.div `

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
				<StyledTableHeader columns={this.props.columns}>
					{
						this.props.tableHeader.map(function(headerElement) {
						  return (<div>{headerElement}</div>);
						})
					}
				</StyledTableHeader>
			</StyledTable>
		);
	}
}