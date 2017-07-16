export default class SaturationWeights {
    constructor(saturationParameters) {
        this.saturationParameters = saturationParameters;
    }

    getRepresentationArray() {
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
}