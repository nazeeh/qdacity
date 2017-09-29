import React from 'react';
import styled from 'styled-components';

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

export default class CellHeader extends React.Component {

	constructor(props) {
		super(props);

		this.expandCollapseClicked = this.expandCollapseClicked.bind(this);
	}

	expandCollapseClicked() {
		this.props.umlEditor.getGraphView().toggleCollapseCell(this.props.cell);
	}

	render() {
		return (
			<StyledHeader>
                {this.renderExpandButton()}
                <StyledHeaderText>{this.props.cellValue.getHeader()}</StyledHeaderText>
            </StyledHeader>
		);
	}

	renderExpandButton() {
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
}