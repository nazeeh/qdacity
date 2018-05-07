export default class CodingDocument {
	constructor(document, totalCodingsCountMainCode) {
		this.document = document;

		this.totalCodingsCountMainCode = totalCodingsCountMainCode;

		this.overlapCollections = {};
	}

	getDocument() {
		return this.document;
	}

	getCodingOverlapCollection(codeId) {
		return this.overlapCollections[codeId];
	}

	getCodingOverlapCount(codeId) {
		if (!this.containsEntry(codeId)) {
			return 0;
		}
		return this.overlapCollections[codeId].getCodingOverlapCount();
	}

	getTotalCodingsCountMainCode() {
		return this.totalCodingsCountMainCode;
	}

	getTotalCodingsCount(codeId) {
		if (!this.containsEntry(codeId)) {
			return 0;
		}
		return this.overlapCollections[codeId].getTotalCodingsCount();
	}

	containsEntry(codeId) {
		return this.overlapCollections.hasOwnProperty(codeId);
	}

	createEntry(codeId, codingOverlapCollection) {
		if (this.containsEntry(codeId)) {
			throw new Error('Entry does already exist: ' + codeId);
		}
		this.overlapCollections[codeId] = codingOverlapCollection;
	}

	addCodingOverlap(codeId, codingOverlap) {
		if (!this.containsEntry(codeId)) {
			throw new Error('Entry does not exist: ' + codeId);
		}

		this.overlapCollections[codeId].addCodingOverlap(codingOverlap);
	}

	hasCodingOverlap(codeId, codingIdMain, codingIdOther) {
		if (!this.containsEntry(codeId)) {
			return false;
		}

		return this.overlapCollections[codeId].hasCodingOverlap(
			codingIdMain,
			codingIdOther
		);
	}
}
