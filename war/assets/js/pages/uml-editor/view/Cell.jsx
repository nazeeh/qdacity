import React from 'react';
import styled from 'styled-components';

import CellHeader from './CellHeader.jsx';
import CellFields from './CellFields.jsx';
import CellMethods from './CellMethods.jsx';

const StyledContainer = styled.div `
    width: 100%; 
    height: 100%; 
    max-width: 350px;
    min-width: 160px;
    
    cursor: move !important;
`;

const StyledSeparator = styled.div `
    height: 1px;
    width: 200%;
    background-color: black;
`;

export default class Cell extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
		if (this.props.collapsed) {
			return (
				<StyledContainer>
                    <CellHeader umlEditor={this.props.umlEditor} cell={this.props.cell} cellValue={this.props.cellValue} collapsed={this.props.collapsed} />  
                </StyledContainer>
			);
		} else {
			return (
				<StyledContainer>
                    <CellHeader umlEditor={this.props.umlEditor} cell={this.props.cell} cellValue={this.props.cellValue} collapsed={this.props.collapsed} /> 
		            <StyledSeparator />
                    <CellFields umlEditor={this.props.umlEditor} cell={this.props.cell} cellValue={this.props.cellValue} selected={this.props.selected} />
		            <StyledSeparator />
                    <CellMethods umlEditor={this.props.umlEditor} cell={this.props.cell} cellValue={this.props.cellValue} selected={this.props.selected} />
                </StyledContainer>
			);
		}
	}
}