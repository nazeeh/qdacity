export default class SaturationWeights {
    constructor(saturationParameters) {
        this.saturationParameters = saturationParameters;
    }

    getNameAndWeightsArray() {
        var sp = this.saturationParameters;
        var saturationWeights = [
            ['Deleted Code Relationships', sp.deleteCodeRelationShipChangeWeight, sp.deleteCodeRelationShipSaturationMaximum], //0
            ['Deleted Codes', sp.deleteCodeChangeWeight, sp.deleteCodeSaturationMaximum], //1
            ['New Code Relationships', sp.insertCodeRelationShipChangeWeight, sp.insertCodeRelationShipSaturationMaximum], //2
            ['New Codes', sp.insertCodeChangeWeight, sp.insertCodeSaturationMaximum], //3
            ['Relocated Codes', sp.relocateCodeChangeWeight, sp.relocateCodeSaturationMaximum], //4
            ['Code Author Changes', sp.updateCodeAuthorChangeWeight, sp.updateCodeAuthorSaturationMaximum], //5
            ['CodeBookEntry Definition Changes', sp.updateCodeBookEntryDefinitionChangeWeight, sp.updateCodeBookEntryDefinitionSaturationMaximum], //6
            ['CodeBookEntry Example Changes', sp.updateCodeBookEntryExampleChangeWeight, sp.updateCodeBookEntryExampleSaturationMaximum], //7
            ['CodeBookEntry Short Definition Changes', sp.updateCodeBookEntryShortDefinitionChangeWeight, sp.updateCodeBookEntryShortDefinitionSaturationMaximum], //8
            ['CodeBookEntry When Not To Use Changes', sp.updateCodeBookEntryWhenNotToUseChangeWeight, sp.updateCodeBookEntryWhenNotToUseSaturationMaximum], //9
            ['CodeBookEntry When To Use Changes', sp.updateCodeBookEntryWhenToUseChangeWeight, sp.updateCodeBookEntryWhenToUseSaturationMaximum], //10
            ['Code Color Changes', sp.updateCodeColorChangeWeight, sp.updateCodeColorSaturationMaximum], //11
            ['Code Memo Changes', sp.updateCodeMemoChangeWeight, sp.updateCodeMemoSaturationMaximum], //12
            ['Code Name Changes', sp.updateCodeNameChangeWeight, sp.updateCodeNameSaturationMaximum] //13
        ];

        return saturationWeights;
    }

    getCategorizedArray() {
        //categorization can be redefined here.
        //Other js code just expects this structure, 
        //but is not dependent on the actual categories
        //meaning "Title" : [<indices of NameAndWeightsArray which are in this category>]
        //make sure not to use a index twice
        var catArray = {
            "Insert/Delete Codes": [
                3,
                1
            ],
            "Code Changes": [
                4,
                5,
                11,
                12,
                13
            ],
            "Codebook Entry Changes": [
                6,
                7,
                8,
                9,
                10
            ],
            "Code Relationship Changes": [
                2,
                0
            ]
        }
        return catArray;
    }

    getArtificialCategoryIndex(category) {
        var artificalIdx = 0;
        for (var i in this.getCategorizedArray()) {
            if (i === category)
                return artificalIdx;

            artificalIdx = artificalIdx + 1;
        }
        return -1;
    }

    getCategoryForIndex(i) {
        var integer = parseInt(i, 10);
        var catArr = this.getCategorizedArray();
        for (var category in catArr) {
            for (var idx in catArr[category]) {
                if (catArr[category][idx] === integer) {
                    return category;
                }
            }
        }
        return "NO CATEGORY FOR INDEX " + i;
    }

    getCompleteCategory(saturation, category) {
        var catIds = this.getCategorizedArray()[category];
        var completeArray = this.getNameAndWeightsAndSaturationArray(saturation);
        if (catIds !== 'undefined') {
            var retArr = [];
            for (var i in catIds) {
                var realId = catIds[i];
                retArr = retArr.concat([completeArray[realId]]);
            }
            return retArr;
        } else {
            return 'undefined';
        }
    }

    getPropertyNamesArrayNoSuffix() {
        //Order needs to be same as getNameAndWeightsArray!
        var propertyNames = [
            'deleteCodeRelationShip', //0
            'deleteCode', //1
            'insertCodeRelationShip', //2
            'insertCode', //3
            'relocateCode', //4
            'updateCodeAuthor', //5
            'updateCodeBookEntryDefinition', //6
            'updateCodeBookEntryExample', //7
            'updateCodeBookEntryShortDefinition', //8
            'updateCodeBookEntryWhenNotToUse', //9
            'updateCodeBookEntryWhenToUse', //10
            'updateCodeColor', //11
            'updateCodeMemo', //12
            'updateCodeName', //13
        ];

        return propertyNames;
    }

    getPropertyNamesChangeWeight() {
        var propNames = this.getPropertyNamesArrayNoSuffix();
        for (var i in propNames) {
            propNames[i] = propNames[i] + 'ChangeWeight';
        }
        return propNames;
    }

    getPropertyNamesSaturationMaximum() {
        var propNames = this.getPropertyNamesArrayNoSuffix();
        for (var i in propNames) {
            propNames[i] = propNames[i] + 'SaturationMaximum';
        }
        return propNames;
    }

    getNameAndWeightsAndSaturationArray(saturation) {
        var nameAndWeights = this.getNameAndWeightsArray();
        nameAndWeights[0] = nameAndWeights[0].concat(saturation.deleteCodeRelationShipSaturation);
        nameAndWeights[1] = nameAndWeights[1].concat(saturation.deleteCodeSaturation);
        nameAndWeights[2] = nameAndWeights[2].concat(saturation.insertCodeRelationShipSaturation);
        nameAndWeights[3] = nameAndWeights[3].concat(saturation.insertCodeSaturation);
        nameAndWeights[4] = nameAndWeights[4].concat(saturation.relocateCodeSaturation);
        nameAndWeights[5] = nameAndWeights[5].concat(saturation.updateCodeAuthorSaturation);
        nameAndWeights[6] = nameAndWeights[6].concat(saturation.updateCodeBookEntryDefinitionSaturation);
        nameAndWeights[7] = nameAndWeights[7].concat(saturation.updateCodeBookEntryExampleSaturation);
        nameAndWeights[8] = nameAndWeights[8].concat(saturation.updateCodeBookEntryShortDefinitionSaturation);
        nameAndWeights[9] = nameAndWeights[9].concat(saturation.updateCodeBookEntryWhenNotToUseSaturation);
        nameAndWeights[10] = nameAndWeights[10].concat(saturation.updateCodeBookEntryWhenToUseSaturation);
        nameAndWeights[11] = nameAndWeights[11].concat(saturation.updateCodeColorSaturation);
        nameAndWeights[12] = nameAndWeights[12].concat(saturation.updateCodeMemoSaturation);
        nameAndWeights[13] = nameAndWeights[13].concat(saturation.updateCodeNameSaturation);

        return nameAndWeights;
    }
}