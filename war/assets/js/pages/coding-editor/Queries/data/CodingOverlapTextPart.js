
export default class CodingOverlapTextPart {
    
	constructor(text, codingIds) {
        this.text = text;
        this.codingIds = codingIds;
    }

    getText() {
        return this.text;
    }

    getCodingIds() {
        return this.codingIds;
    }
}