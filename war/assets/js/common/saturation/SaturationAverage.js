export default class SaturationAverage {
    constructor(saturation) {
        this.saturation = saturation;
    }

    calculateAvgSaturation(inPercent) {
        var sr = this.saturation;
        var pr = sr.saturationParameters;
        if (pr != undefined) {
            //weights are set beween 0 and 1 and are > 1 in total. 
            // we need to normalize them when calculating the weighted average
            var sumParameters = pr.appliedCodesChangeWeight
                    + pr.deleteCodeRelationShipChangeWeight
                    + pr.deleteCodeChangeWeight
                    + pr.insertDocumentChangeWeight
                    + pr.insertCodeRelationShipChangeWeight
                    + pr.insertCodeChangeWeight
                    + pr.relocateCodeChangeWeight
                    + pr.updateCodeAuthorChangeWeight
                    + pr.updateCodeBookEntryDefinitionChangeWeight
                    + pr.updateCodeBookEntryExampleChangeWeight
                    + pr.updateCodeBookEntryShortDefinitionChangeWeight
                    + pr.updateCodeBookEntryWhenNotToUseChangeWeight
                    + pr.updateCodeBookEntryWhenToUseChangeWeight
                    + pr.updateCodeColorChangeWeight
                    + pr.updateCodeMemoChangeWeight
                    + pr.updateCodeNameChangeWeight;
            var weightedAvg = sr.applyCodeSaturation * (pr.appliedCodesChangeWeight / sumParameters)
                    + sr.deleteCodeRelationShipSaturation * (pr.deleteCodeRelationShipChangeWeight / sumParameters)
                    + sr.deleteCodeSaturation * (pr.deleteCodeChangeWeight / sumParameters)
                    + sr.documentSaturation * (pr.insertDocumentChangeWeight / sumParameters)
                    + sr.insertCodeRelationShipSaturation * (pr.insertCodeRelationShipChangeWeight / sumParameters)
                    + sr.insertCodeSaturation * (pr.insertCodeChangeWeight / sumParameters)
                    + sr.relocateCodeSaturation * (pr.relocateCodeChangeWeight / sumParameters)
                    + sr.updateCodeAuthorSaturation * (pr.updateCodeAuthorChangeWeight / sumParameters)
                    + sr.updateCodeBookEntryDefinitionSaturation * (pr.updateCodeBookEntryDefinitionChangeWeight / sumParameters)
                    + sr.updateCodeBookEntryExampleSaturation * (pr.updateCodeBookEntryExampleChangeWeight / sumParameters)
                    + sr.updateCodeBookEntryShortDefinitionSaturation * (pr.updateCodeBookEntryShortDefinitionChangeWeight / sumParameters)
                    + sr.updateCodeBookEntryWhenNotToUseSaturation * (pr.updateCodeBookEntryWhenNotToUseChangeWeight / sumParameters)
                    + sr.updateCodeBookEntryWhenToUseSaturation * (pr.updateCodeBookEntryWhenToUseChangeWeight / sumParameters)
                    + sr.updateCodeColorSaturation * (pr.updateCodeColorChangeWeight / sumParameters)
                    + sr.updateCodeMemoSaturation * (pr.updateCodeMemoChangeWeight / sumParameters)
                    + sr.updateCodeNameSaturation * (pr.updateCodeNameChangeWeight / sumParameters);
            if(inPercent === true) {
                return (weightedAvg * 100).toFixed(2) + "%";
            } else {
                return weightedAvg;
            }
        } else {
            return "N/A";
        }
    }
}
