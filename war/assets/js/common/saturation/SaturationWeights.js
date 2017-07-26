export default class SaturationWeights {
    constructor(saturationParameters) {
        this.saturationParameters = saturationParameters;
    }

    getNameAndWeightsArray() {
        var sp = this.saturationParameters;
        var saturationWeights = [
            ['Applied Codes', sp.appliedCodesChangeWeight, sp.appliedCodesSaturationMaximum  ],
            ['Deleted Code Relationships', sp.deleteCodeRelationShipChangeWeight, sp.deleteCodeRelationShipSaturationMaximum  ],
            ['Deleted Codes', sp.deleteCodeChangeWeight, sp.deleteCodeSaturationMaximum  ],
            ['New Documents', sp.insertDocumentChangeWeight, sp.insertDocumentSaturationMaximum  ],
            ['New Code Relationships', sp.insertCodeRelationShipChangeWeight, sp.insertCodeRelationShipSaturationMaximum  ],
            ['New Codes', sp.insertCodeChangeWeight, sp.insertCodeSaturationMaximum  ],
            ['Relocated Codes', sp.relocateCodeChangeWeight, sp.relocateCodeSaturationMaximum  ],
            ['Code Author Changes', sp.updateCodeAuthorChangeWeight, sp.updateCodeAuthorSaturationMaximum  ],
            ['CodeBookEntry Definition Changes', sp.updateCodeBookEntryDefinitionChangeWeight, sp.updateCodeBookEntryDefinitionSaturationMaximum  ],
            ['CodeBookEntry Example Changes', sp.updateCodeBookEntryExampleChangeWeight, sp.updateCodeBookEntryExampleSaturationMaximum  ],
            ['CodeBookEntry Short Definition Changes', sp.updateCodeBookEntryShortDefinitionChangeWeight, sp.updateCodeBookEntryShortDefinitionSaturationMaximum  ],
            ['CodeBookEntry When Not To Use Changes', sp.updateCodeBookEntryWhenNotToUseChangeWeight, sp.updateCodeBookEntryWhenNotToUseSaturationMaximum  ],
            ['CodeBookEntry When To Use Changes', sp.updateCodeBookEntryWhenToUseChangeWeight, sp.updateCodeBookEntryWhenToUseSaturationMaximum  ],
            ['Code Color Changes', sp.updateCodeColorChangeWeight, sp.updateCodeColorSaturationMaximum  ],
            ['Code Memo Changes', sp.updateCodeMemoChangeWeight, sp.updateCodeMemoSaturationMaximum  ],
            ['Code Name Changes', sp.updateCodeNameChangeWeight, sp.updateCodeNameSaturationMaximum  ]
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