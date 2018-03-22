import React from 'react';
import styled from 'styled-components';

const StyledParagraph = styled.p`
    margin: 7px 0px;
    display: block;
`;

const StyledTextPart = styled.span`
    background-color: ${props => 
        (props.containsMainCoding && !props.containsOtherCoding ? '#B5D5FF' : 
        (!props.containsMainCoding && props.containsOtherCoding ? '#D9C8DA' : 
        (props.containsMainCoding && props.containsOtherCoding ? '#FCBBB4' : '')))};
`;

export default class CodingOverlapText extends React.Component {

	constructor(props) {
		super(props);
	}

    render() {
        const _this = this;

		const paragraphs = this.props.codingOverlapText.getParagraphs();

        return (
            <div>
                {paragraphs.map((paragraph) => {
					return _this.renderParagraph(paragraph);
				})}
            </div>
        );
    }

    renderParagraph(paragraph) {
        const _this = this;

        const textParts = paragraph.getTextParts();

        return (
            <StyledParagraph>
                {textParts.map((textPart) => {
					return _this.renderTextPart(textPart);
				})}
            </StyledParagraph>
        );
    }

    renderTextPart(textPart) {
		const codingIdMain = this.props.codingOverlapText.getCodingOverlap().getCodingIdMain();
		const codingIdOther = this.props.codingOverlapText.getCodingOverlap().getCodingIdOther();

        const containsMainCoding = textPart.getCodingIds().indexOf(codingIdMain) != -1;
        const containsOtherCoding = textPart.getCodingIds().indexOf(codingIdOther) != -1;

        return (
            <StyledTextPart containsMainCoding={containsMainCoding} containsOtherCoding={containsOtherCoding}>
                {textPart.getText()}
            </StyledTextPart>
        );
	}
}
