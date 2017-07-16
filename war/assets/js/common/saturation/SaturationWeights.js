export default class SaturationWeights {
    constructor(saturationParameters) {
        this.saturationParameters = saturationParameters;
    }

    getNameAndWeightsArray() {
        var sp = this.saturationParameters;
        var saturationWeights = [
            ['Applied Codes', sp.appliedCodesChangeWeight],
            ['Deleted Code Relationships', sp.deleteCodeRelationShipChangeWeight],
            ['Deleted Codes', sp.deleteCodeChangeWeight],
            ['New Documents', sp.insertDocumentChangeWeight],
            ['New Code Relationships', sp.insertCodeRelationShipChangeWeight],
            ['New Codes', sp.insertCodeChangeWeight],
            ['Relocated Codes', sp.relocateCodeChangeWeight],
            ['Code Author Changes', sp.updateCodeAuthorChangeWeight],
            ['CodeBookEntry Definition Changes', sp.updateCodeBookEntryDefinitionChangeWeight],
            ['CodeBookEntry Example Changes', sp.updateCodeBookEntryExampleChangeWeight],
            ['CodeBookEntry Short Definition Changes', sp.updateCodeBookEntryShortDefinitionChangeWeight],
            ['CodeBookEntry When Not To Use Changes', sp.updateCodeBookEntryWhenNotToUseChangeWeight],
            ['CodeBookEntry When To Use Changes', sp.updateCodeBookEntryWhenToUseChangeWeight],
            ['Code Color Changes', sp.updateCodeColorChangeWeight],
            ['Code Memo Changes', sp.updateCodeMemoChangeWeight],
            ['Code Name Changes', sp.updateCodeNameChangeWeight]
        ];

        return saturationWeights;
    }

    getNameAndWeightsAndSaturationArray(saturation) {
        var nameAndWeights = this.getNameAndWeightsArray();
        nameAndWeights[0] = nameAndWeights[0].concat(saturation.applyCodeSaturation);
        nameAndWeights[1] = nameAndWeights[1].concat(saturation.deleteCodeRelationShipSaturation);
        nameAndWeights[2] = nameAndWeights[2].concat(saturation.deleteCodeSaturation);
        nameAndWeights[3] = nameAndWeights[3].concat(saturation.documentSaturation);
        nameAndWeights[4] = nameAndWeights[4].concat(saturation.insertCodeRelationShipSaturation);
        nameAndWeights[5] = nameAndWeights[5].concat(saturation.insertCodeSaturation);
        nameAndWeights[6] = nameAndWeights[6].concat(saturation.relocateCodeSaturation);
        nameAndWeights[7] = nameAndWeights[7].concat(saturation.updateCodeAuthorSaturation);
        nameAndWeights[8] = nameAndWeights[8].concat(saturation.updateCodeBookEntryDefinitionSaturation);
        nameAndWeights[9] = nameAndWeights[9].concat(saturation.updateCodeBookEntryExampleSaturation);
        nameAndWeights[10] = nameAndWeights[10].concat(saturation.updateCodeBookEntryShortDefinitionSaturation);
        nameAndWeights[11] = nameAndWeights[11].concat(saturation.updateCodeBookEntryWhenNotToUseSaturation);
        nameAndWeights[12] = nameAndWeights[12].concat(saturation.updateCodeBookEntryWhenToUseSaturation);
        nameAndWeights[13] = nameAndWeights[13].concat(saturation.updateCodeColorSaturation);
        nameAndWeights[14] = nameAndWeights[14].concat(saturation.updateCodeMemoSaturation);
        nameAndWeights[15] = nameAndWeights[15].concat(saturation.updateCodeNameSaturation);

        return nameAndWeights;
    }
}