
export default class CodingOverlapCollection {
    
    constructor(codeId, totalCodingsCount) {
        this.codeId = codeId;
        this.totalCodingsCount = totalCodingsCount;

        this.codingOverlaps = [];
    }

    getCodeId() {
        return this.codeId;
    }

    getCodingOverlaps() {
        return this.codingOverlaps;
    }

    getCodingOverlapCount() {
        return this.codingOverlaps.length;
    }

    getTotalCodingsCount() {
        return this.totalCodingsCount;
    }

    hasCodingOverlap(codingIdMain, codingIdOther) {
        return this.codingOverlaps.find((codingOverlap) => {
            return codingOverlap.getCodingIdMain() == codingIdMain && codingOverlap.getCodingIdOther() == codingIdOther;
        });
    }

    addCodingOverlap(codingOverlap) {
        this.codingOverlaps.push(codingOverlap);
    }
}
