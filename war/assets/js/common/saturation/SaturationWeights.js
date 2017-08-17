export default class SaturationWeights {
	constructor(saturationParameters) {
		this.saturationParameters = saturationParameters;
	}

	getNameAndWeightsArray() {
		var sp = this.saturationParameters;
		var saturationWeights = [
			['Applied Codes', sp.appliedCodesChangeWeight, sp.appliedCodesSaturationMaximum], //0
			['Deleted Code Relationships', sp.deleteCodeRelationShipChangeWeight, sp.deleteCodeRelationShipSaturationMaximum], //1
			['Deleted Codes', sp.deleteCodeChangeWeight, sp.deleteCodeSaturationMaximum], //2
			['New Documents', sp.insertDocumentChangeWeight, sp.insertDocumentSaturationMaximum], //3
			['New Code Relationships', sp.insertCodeRelationShipChangeWeight, sp.insertCodeRelationShipSaturationMaximum], //4
			['New Codes', sp.insertCodeChangeWeight, sp.insertCodeSaturationMaximum], //5
			['Relocated Codes', sp.relocateCodeChangeWeight, sp.relocateCodeSaturationMaximum], //6
			['Code Author Changes', sp.updateCodeAuthorChangeWeight, sp.updateCodeAuthorSaturationMaximum], //7
			['CodeBookEntry Definition Changes', sp.updateCodeBookEntryDefinitionChangeWeight, sp.updateCodeBookEntryDefinitionSaturationMaximum], //8
			['CodeBookEntry Example Changes', sp.updateCodeBookEntryExampleChangeWeight, sp.updateCodeBookEntryExampleSaturationMaximum], //9
			['CodeBookEntry Short Definition Changes', sp.updateCodeBookEntryShortDefinitionChangeWeight, sp.updateCodeBookEntryShortDefinitionSaturationMaximum], //10
			['CodeBookEntry When Not To Use Changes', sp.updateCodeBookEntryWhenNotToUseChangeWeight, sp.updateCodeBookEntryWhenNotToUseSaturationMaximum], //11
			['CodeBookEntry When To Use Changes', sp.updateCodeBookEntryWhenToUseChangeWeight, sp.updateCodeBookEntryWhenToUseSaturationMaximum], //12
			['Code Color Changes', sp.updateCodeColorChangeWeight, sp.updateCodeColorSaturationMaximum], //13
			['Code Memo Changes', sp.updateCodeMemoChangeWeight, sp.updateCodeMemoSaturationMaximum], //14
			['Code Name Changes', sp.updateCodeNameChangeWeight, sp.updateCodeNameSaturationMaximum] //15
		];

		return saturationWeights;
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

	getCategorizedArray() {
		//categorization can be redefined here.
		//Other js code just expects this structure, 
		//but is not dependent on the actual categories
		//meaning "Title" : [<indices of NameAndWeightsArray which are in this category>]
		//make sure not to use a index twice
		var catArray = {
			"Code applies": [
				0
			],
			"Insert/Delete Codes": [
				5,
				2
			],
			"Code Changes": [
				6,
				7,
				13,
				14,
				15
			],
			"Codebook Entry Changes": [
				8,
				9,
				10,
				11,
				12
			],
			"Code Relationship Changes": [
				4,
				1
			],
			"Document Changes": [
				3
			]
		}
		return catArray;
	}

	getPropertyNamesArrayNoSuffix() {
		var propertyNames = [
			'insertDocument',
			'insertCode',
			'updateCodeAuthor',
			'updateCodeColor',
			'updateCodeMemo',
			'updateCodeName',
			'updateCodeId',
			'relocateCode',
			'insertCodeRelationShip',
			'deleteCodeRelationShip',
			'deleteCode',
			'appliedCodes',
			'updateCodeBookEntryDefinition',
			'updateCodeBookEntryExample',
			'updateCodeBookEntryShortDefinition',
			'updateCodeBookEntryWhenNotToUse',
			'updateCodeBookEntryWhenToUse'
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