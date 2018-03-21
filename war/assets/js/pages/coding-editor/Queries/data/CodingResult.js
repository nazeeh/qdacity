
export default class CodingResult {
    
	constructor(code) {
        this.code = code;

        this.documents = [];
    }

    getCode() {
        return this.code;
    }

    getTotalCodingsCountMainCode() {
        return this.totalCodingsCount;
    }

    getTotalCodingsCountMainCode() {
        return this.iterateOverDocuments((document) => document.getTotalCodingsCountMainCode());
    }

    getTotalCodingsCount(codeId) {
        return this.iterateOverDocuments((document) => document.getTotalCodingsCount(codeId));
    }

    getCodingOverlapCount(codeId) {
        return this.iterateOverDocuments((document) => document.getCodingOverlapCount(codeId));
    }

    getAverageOverlapPercentageByMainCode(codeId) {
        return this.getAverageOverlapPercentage(codeId, (codingOverlap) => codingOverlap.getOverlapPercentageByMainCode());
    }
    
    getAverageOverlapPercentageByOtherCode(codeId) {
        return this.getAverageOverlapPercentage(codeId, (codingOverlap) => codingOverlap.getOverlapPercentageByOtherCode());
    }

    getAverageOverlapPercentage(codeId, funcGetOverlapPercentage) {
        if (this.documents.length == 0) {
            return 0.0;
        }

        let totalPercentage = 0.0;
        let counter = 0;

        for (let i = 0; i < this.documents.length; i++) {
            const codingOverlapCollection = this.documents[i].getCodingOverlapCollection(codeId);

            if (codingOverlapCollection != null) {
                const codingOverlaps = codingOverlapCollection.getCodingOverlaps();

                for (let j = 0; j < codingOverlaps.length; j++) {
                    totalPercentage += funcGetOverlapPercentage(codingOverlaps[j]);
                }

                counter += codingOverlapCollection.getCodingOverlapCount();
            }
        }

        if (counter == 0) {
            return 0.0;
        }

        return totalPercentage / counter;
    }

    iterateOverDocuments(func) {
        let value = 0;

        for (let i = 0; i < this.documents.length; i++) {
            value += func(this.documents[i]);
        }

        return value;
    }

    addDocument(document) {
        this.documents.push(document);
    }

    getDocument(id) {
        return this.documents.find((document) => {
            return document.getDocument().id == id;
        });
    }
}
