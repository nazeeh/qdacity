
export default class CodingOverlapCollection {
    
	constructor() {
        this.codingOverlaps = [];

        this.averageOverlapPercentageByMainCode = 0.0;
        this.averageOverlapPercentageByOtherCode = 0.0;
    }

    getCodingOverlaps() {
        return this.codingOverlaps;
    }

    getCodingCount() {
        return this.codingOverlaps.length;
    }

    getAverageOverlapPercentageByMainCode() {
        return this.averageOverlapPercentageByMainCode;
    }

    getAverageOverlapPercentageByOtherCode() {
        return this.averageOverlapPercentageByOtherCode;
    }

    addCodingOverlap(codingOverlap) {
        this.codingOverlaps.push(codingOverlap);

        this.recalculateAverageOverlapPercentage();
    }

    hasCodingOverlap(codingOverlapKey) {
        return this.codingOverlaps.find((codingOverlap) => {
            return codingOverlap.getKey() == codingOverlapKey;
        });
    }

    recalculateAverageOverlapPercentage() {
        let count = this.codingOverlaps.length;

        if (count == 0) {
            return;
        }

        let totalOverlapPercentageByMainCode = 0.0;
        let totalOverlapPercentageByOtherCode = 0.0;

        for (let i = 0; i < count; i++) {
            totalOverlapPercentageByMainCode = totalOverlapPercentageByMainCode + this.codingOverlaps[i].getOverlapPercentageByMainCode();
            totalOverlapPercentageByOtherCode = totalOverlapPercentageByOtherCode + this.codingOverlaps[i].getOverlapPercentageByOtherCode();
        }

        this.averageOverlapPercentageByMainCode = totalOverlapPercentageByMainCode / count;
        this.averageOverlapPercentageByOtherCode = totalOverlapPercentageByOtherCode / count;
    }
}
