
export default class CodingOverlap {
    
	constructor(key, document, textMainCode, textOtherCode, textOverlap) {
        this.key = key;

        this.document = document;

        this.textMainCode = textMainCode;
        this.textOtherCode = textOtherCode;
        this.textOverlap = textOverlap;

        this.overlapPercentageByMainCode = this.textOverlap.length / this.textMainCode.length;
        this.overlapPercentageByOtherCode = this.textOverlap.length / this.textOtherCode.length;
    }

    getKey() {
        return this.key;
    }

    getDocument() {
        return this.document;
    }

    getTextMainCode() {
        return this.textMainCode;
    }

    getTextOtherCode() {
        return this.textOtherCode;
    }

    getTextOverlap() {
        return this.textOverlap;
    }

    getOverlapPercentageByMainCode() {
        return this.overlapPercentageByMainCode;
    }
    
    getOverlapPercentageByOtherCode() {
        return this.overlapPercentageByOtherCode;
    }
}
