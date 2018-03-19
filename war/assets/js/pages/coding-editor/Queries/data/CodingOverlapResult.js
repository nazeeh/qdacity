import CodingOverlapCollection from './CodingOverlapCollection.js';

export default class CodingOverlapResult {
    
	constructor(code) {
        this.code = code;

        this.overlapCollections = {};
    }

    getCode() {
        return this.code;
    }

    containsEntry(codeKey) {
        return this.overlapCollections.hasOwnProperty(codeKey);
    }

    createEntry(codeKey) {
        if (this.containsEntry(codeKey)) {
            throw new Error('Object does already exist: ' + codeKey);
        }
        this.overlapCollections[codeKey] = new CodingOverlapCollection();
    }

    getCodingOverlapCollection(codeKey) {
        return this.overlapCollections[codeKey];
    }

    addCodingOverlap(codeKey, codingOverlap) {
        if (!this.containsEntry(codeKey)) {
            this.createEntry(codeKey);
        }

        this.overlapCollections[codeKey].addCodingOverlap(codingOverlap);
    }

    hasCodingOverlap(codeKey, codingOverlapKey) {
        if (!this.containsEntry(codeKey)) {
            return false;
        }

        return this.overlapCollections[codeKey].hasCodingOverlap(codingOverlapKey);
    }
}
