import React from 'react';
import styled from 'styled-components';

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

const StyledElements = styled.div `
    padding-top: 4px;
    padding-bottom: 4px;
    width: 100%;    
`;

const StyledElementsEmpty = styled.div `
    width: 100%;    
    height: 18px;
`;

const StyledElement = styled.div `
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-left: 6px;
    margin-right: 6px;
`;

const StyledElementAccessibility = styled.div `
    line-height: 18px;
    width: 9px !important;
    min-width: 9px !important;
    max-width: 9px !important;
    font-size: 11.5px; 
    font-weight: normal; 
    text-align: left;
`;

const StyledElementText = styled.div `
    flex-grow: 1;
    line-height: 18px;
    font-size: 11.5px; 
    font-weight: normal; 
    text-align: left;
    overflow: hidden; 
    text-overflow: ellipsis;
    white-space: normal;
`;

const StyledElementAddContainer = styled.div `
    height: 18px;
    line-height: 18px;
    margin-left: 6px;
    margin-right: 6px;
    text-align: left;
`;

const StyledElementAdd = styled.a `
    height: 18px;
    line-height: 18px;
    font-size: 11.5px; 
    cursor: pointer;
`;

const StyledElementRemove = styled.div `
    height: 18px;
    padding-left: 3px;
    padding-right: 3px;
    margin-left: 4px;
    cursor: pointer;
    opacity: 0.5;
    
    &:hover {
        float: right; 
        cursor: pointer;
        opacity: 1;
    }
`;

export default class Cell extends React.Component {

	constructor(props) {
		super(props);

		this.expandCollapseClicked = this.expandCollapseClicked.bind(this);
		this.addFieldClicked = this.addFieldClicked.bind(this);
		this.addMethodClicked = this.addMethodClicked.bind(this);
	}

	expandCollapseClicked() {
		this.props.umlEditor.getUmlGraphView().toggleCollapseCell(this.props.cell);
	}

	addFieldClicked() {
		this.props.umlEditor.openClassFieldModal(this.props.cell);
	}

	addMethodClicked() {
		this.props.umlEditor.openClassMethodModal(this.props.cell);
	}

	removeFieldClicked(relationId) {
		this.props.umlEditor.deleteClassField(this.props.cell, relationId)
	}

	removeMethodClicked(relationId) {
		this.props.umlEditor.deleteClassMethod(this.props.cell, relationId)
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
                    {this.renderFields()}
                    {this.renderSeparator()}
                    {this.renderMethods()}
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

	renderFields() {
		return this.renderElements(this.props.cellValue.getFields(), 'Field', this.addFieldClicked, this.removeFieldClicked);
	}

	renderMethods() {
		return this.renderElements(this.props.cellValue.getMethods(), 'Method', this.addMethodClicked, this.removeMethodClicked);
	}

	renderElements(elements, typeName, addElementClicked, removeElementClicked) {
		const _this = this;

		if (elements != null && elements.length > 0) {
			return (
				<StyledElements>
                    {elements.map((element, i) => {
                        return _this.renderElement(element, typeName, removeElementClicked);
                    })}
                    
                    {
                        (this.props.selected) ? (
                            this.renderElementAdd(typeName, addElementClicked)
                        ) : (
                            ''
                        )
                    }
                </StyledElements>
			);
		} else {
			return (
				<StyledElements>
	                {this.renderElementsEmpty(typeName, addElementClicked)}
                </StyledElements>
			);
		}
	}

	renderElementsEmpty(typeName, addElementClicked) {
		if (this.props.selected) {
			return this.renderElementAdd(typeName, addElementClicked);
		} else {
			return (
				<StyledElementsEmpty />
			);
		}
	}

	renderElement(element, typename, removeElementClicked) {
		return (
			<StyledElement>
                <StyledElementAccessibility>{element.getAccessibility()}</StyledElementAccessibility>
                
                <StyledElementText>{element.getText()}</StyledElementText>

                {
                    (this.props.selected) ? (
                        <StyledElementRemove onClick={removeElementClicked.bind(this, element.getRelationId())} >
                            <i className="fa fa-trash fa-1x"></i>
                        </StyledElementRemove>
                    ) : (
                        ''
                    )
                }
            </StyledElement>
		);
	}

	renderElementAdd(typeName, addElementClicked) {
		return (
			<StyledElementAddContainer onClick={addElementClicked}>
                <StyledElementAdd>+ Add {typeName}</StyledElementAdd>
            </StyledElementAddContainer>
		);
	}
}