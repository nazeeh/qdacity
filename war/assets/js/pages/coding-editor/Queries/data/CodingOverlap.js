
export default class CodingOverlap {
    
	constructor(codingIdMain, codingIdOther) {
        this.codingIdMain = codingIdMain;
        this.codingIdOther = codingIdOther;

        this.textContent = null;
    }

    getCodingIdMain() {
        return this.codingIdMain;
    }

    getCodingIdOther() {
        return this.codingIdOther;
    }

    getTextContent() {
        return this.textContent;
    }

    setTextContent(textContent) {
        this.textContent = textContent;
    }

    getOverlapPercentageByMainCode() {
        return this.textContent.getTextLengthOverlap() / this.textContent.getTextLengthMainCode();
    }
    
    getOverlapPercentageByOtherCode() {
        return this.textContent.getTextLengthOverlap() / this.textContent.getTextLengthOtherCode();
    }
}
