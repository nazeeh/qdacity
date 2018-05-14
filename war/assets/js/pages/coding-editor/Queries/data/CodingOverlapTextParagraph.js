export default class CodingOverlapTextParagraph {
	constructor() {
		this.textParts = [];
	}

	getTextParts() {
		return this.textParts;
	}

	addPart(textPart) {
		this.textParts.push(textPart);
	}
}
