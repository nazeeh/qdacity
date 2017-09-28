import React from 'react';
import styled from 'styled-components';

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

		this.addElementClicked = this.addElementClicked.bind(this);
	}

	getElements() {
		return [];
	}

	getElementName() {
		return '';
	}

	addElementClicked() {

	}

	removeElementClicked(relationId) {

	}

	render() {
		const _this = this;

		const elements = this.getElements();

		if (elements != null && elements.length > 0) {
			return (
				<StyledElements>
                    {elements.map((element, i) => {
                        return _this.renderElement(element);
                    })}
                    
                    {
                        (this.props.selected) ? (
                            this.renderElementAdd()
                        ) : (
                            ''
                        )
                    }
                </StyledElements>
			);
		} else {
			return (
				<StyledElements>
                    {this.renderElementsEmpty()}
                </StyledElements>
			);
		}
	}

	renderElementsEmpty() {
		if (this.props.selected) {
			return this.renderElementAdd();
		} else {
			return (
				<StyledElementsEmpty />
			);
		}
	}

	renderElement(element) {
		return (
			<StyledElement>
                <StyledElementAccessibility>{element.getAccessibility()}</StyledElementAccessibility>
                
                <StyledElementText>{element.getText()}</StyledElementText>

                {
                    (this.props.selected) ? (
                        <StyledElementRemove onClick={this.removeElementClicked.bind(this, element.getRelationId())} >
                            <i className="fa fa-trash fa-1x"></i>
                        </StyledElementRemove>
                    ) : (
                        ''
                    )
                }
            </StyledElement>
		);
	}

	renderElementAdd() {
		return (
			<StyledElementAddContainer onClick={this.addElementClicked}>
                <StyledElementAdd>+ Add {this.getElementName()}</StyledElementAdd>
            </StyledElementAddContainer>
		);
	}
}