import React from 'react';
import styled from 'styled-components';

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
            <p>
                {textParts.map((textPart) => {
					return _this.renderTextPart(textPart);
				})}
            </p>
        );
    }

    renderTextPart(textPart) {
		let color = null;
		
		const codingIdMain = this.props.codingOverlapText.getCodingOverlap().getCodingIdMain();
		const codingIdOther = this.props.codingOverlapText.getCodingOverlap().getCodingIdOther();

        const containsMainCoding = textPart.getCodingIds().indexOf(codingIdMain) != -1;
        const containsOtherCoding = textPart.getCodingIds().indexOf(codingIdOther) != -1;

        if (containsMainCoding && !containsOtherCoding) {
            color = 'red';
        }
        else if (!containsMainCoding && containsOtherCoding) {
            color = 'blue';
        }
        else if (containsMainCoding && containsOtherCoding) {
            color = 'purple';
        }

        return (
            <p color={color}>
                {textPart.getText()}
            </p>
        );
	}
}
