export default class CodingOverlapText {
	constructor(codingOverlap) {
		this.paragraphs = [];

		this.codingOverlap = codingOverlap;

		this.textLengthMainCode = 0;
		this.textLengthOtherCode = 0;
		this.textLengthOverlap = 0;
	}

	getCodingOverlap() {
		return this.codingOverlap;
	}

	getTextLengthMainCode() {
		return this.textLengthMainCode;
	}

	getTextLengthOtherCode() {
		return this.textLengthOtherCode;
	}

	getTextLengthOverlap() {
		return this.textLengthOverlap;
	}

	getParagraphs() {
		return this.paragraphs;
	}

	addParagraph(paragraph) {
		this.paragraphs.push(paragraph);

		this.updateTextLengths();
	}

	updateTextLengths() {
		const codingIdMain = this.codingOverlap.getCodingIdMain();
		const codingIdOther = this.codingOverlap.getCodingIdOther();

		this.textLengthMainCode = this.getTextLength(
			codingIds => codingIds.indexOf(codingIdMain) != -1
		);
		this.textLengthOtherCode = this.getTextLength(
			codingIds => codingIds.indexOf(codingIdOther) != -1
		);
		this.textLengthOverlap = this.getTextLength(
			codingIds =>
				codingIds.indexOf(codingIdMain) != -1 &&
				codingIds.indexOf(codingIdOther) != -1
		);
	}

	getTextLength(evaluateCodingIds) {
		let text = '';

		for (let i = 0; i < this.paragraphs.length; i++) {
			const paragraph = this.paragraphs[i];
			const textParts = paragraph.getTextParts();

			for (let j = 0; j < textParts.length; j++) {
				const textPart = textParts[j];

				if (evaluateCodingIds(textPart.getCodingIds())) {
					text += textPart.getText();
				}
			}
		}
		return text.length;
	}
}
