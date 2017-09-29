import React from 'react';
import styled from 'styled-components';

import CellFields from './CellFields.jsx';
import CellMethods from './CellMethods.jsx';

const StyledContainer = styled.div `
    width: 100%; 
    height: 100%; 
    max-width: 350px;
    min-width: 160px;
    
    cursor: move !important;
`;

const StyledHeader = styled.div `
    display: flex;
    flex-direction: row;
    
    margin-left: 5px;
    margin-right: 5px;
`;

const StyledHeaderText = styled.div `
    flex-grow: 1;
    margin-left: 3px;
    margin-right: 16px;
    line-height: 20px;
    
    color: black;
    font-size: 13px;
    font-weight: bold;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;    
`;

const StyledHeaderExpandButton = styled.div `
    align-self: center;
    width: 13px;
    cursor: pointer;
`;

const StyledSeparator = styled.div `
    height: 1px;
    width: 200%;
    background-color: black;
`;

export default class Cell extends React.Component {

	constructor(props) {
		super(props);

		this.expandCollapseClicked = this.expandCollapseClicked.bind(this);
	}

	expandCollapseClicked() {
		this.props.umlEditor.getUmlGraphView().toggleCollapseCell(this.props.cell);
	}

	render() {
		if (this.props.collapsed) {
			return (
				<StyledContainer>
                    {this.renderHeader()}    
                </StyledContainer>
			);
		} else {
			return (
				<StyledContainer>
                    {this.renderHeader()}
                    {this.renderSeparator()}
                    <CellFields umlEditor={this.props.umlEditor} cell={this.props.cell} cellValue={this.props.cellValue} selected={this.props.selected} />
                    {this.renderSeparator()}
                    <CellMethods umlEditor={this.props.umlEditor} cell={this.props.cell} cellValue={this.props.cellValue} selected={this.props.selected} />
                </StyledContainer>
			);
		}
	}

	renderHeader() {
		return (
			<StyledHeader>
                {this.renderHeaderExpandButton()}
                <StyledHeaderText>{this.props.cellValue.getHeader()}</StyledHeaderText>
            </StyledHeader>
		);
	}

	renderHeaderExpandButton() {
		let icon = '';

		if (this.props.collapsed) {
			icon = <i className="fa fa-plus-square-o"></i>;
		} else {
			icon = <i className="fa fa-minus-square-o"></i>;
		}

		return (
			<StyledHeaderExpandButton onClick={this.expandCollapseClicked}>{icon}</StyledHeaderExpandButton>
		)
	}

	renderSeparator() {
		return (
			<StyledSeparator />
		);
	}
}