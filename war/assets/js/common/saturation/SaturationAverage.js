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
			var weightedAvg = this.max1(sr.applyCodeSaturation / pr.appliedCodesSaturationMaximum) * (pr.appliedCodesChangeWeight / sumParameters)
				+ this.max1(sr.deleteCodeRelationShipSaturation / pr.deleteCodeRelationShipSaturationMaximum) * (pr.deleteCodeRelationShipChangeWeight / sumParameters)
				+ this.max1(sr.deleteCodeSaturation / pr.deleteCodeSaturationMaximum) * (pr.deleteCodeChangeWeight / sumParameters)
				+ this.max1(sr.documentSaturation / pr.insertDocumentSaturationMaximum) * (pr.insertDocumentChangeWeight / sumParameters)
				+ this.max1(sr.insertCodeRelationShipSaturation / pr.insertCodeRelationShipSaturationMaximum) * (pr.insertCodeRelationShipChangeWeight / sumParameters)
				+ this.max1(sr.insertCodeSaturation / pr.insertCodeSaturationMaximum) * (pr.insertCodeChangeWeight / sumParameters)
				+ this.max1(sr.relocateCodeSaturation / pr.relocateCodeSaturationMaximum) * (pr.relocateCodeChangeWeight / sumParameters)
				+ this.max1(sr.updateCodeAuthorSaturation / pr.updateCodeAuthorSaturationMaximum) * (pr.updateCodeAuthorChangeWeight / sumParameters)
				+ this.max1(sr.updateCodeBookEntryDefinitionSaturation / pr.updateCodeBookEntryDefinitionSaturationMaximum) * (pr.updateCodeBookEntryDefinitionChangeWeight / sumParameters)
				+ this.max1(sr.updateCodeBookEntryExampleSaturation / pr.updateCodeBookEntryExampleSaturationMaximum) * (pr.updateCodeBookEntryExampleChangeWeight / sumParameters)
				+ this.max1(sr.updateCodeBookEntryShortDefinitionSaturation / pr.updateCodeBookEntryShortDefinitionSaturationMaximum) * (pr.updateCodeBookEntryShortDefinitionChangeWeight / sumParameters)
				+ this.max1(sr.updateCodeBookEntryWhenNotToUseSaturation / pr.updateCodeBookEntryWhenNotToUseSaturationMaximum) * (pr.updateCodeBookEntryWhenNotToUseChangeWeight / sumParameters)
				+ this.max1(sr.updateCodeBookEntryWhenToUseSaturation / pr.updateCodeBookEntryWhenToUseSaturationMaximum) * (pr.updateCodeBookEntryWhenToUseChangeWeight / sumParameters)
				+ this.max1(sr.updateCodeColorSaturation / pr.updateCodeColorSaturationMaximum) * (pr.updateCodeColorChangeWeight / sumParameters)
				+ this.max1(sr.updateCodeMemoSaturation / pr.updateCodeMemoSaturationMaximum) * (pr.updateCodeMemoChangeWeight / sumParameters)
				+ this.max1(sr.updateCodeNameSaturation / pr.updateCodeNameSaturationMaximum) * (pr.updateCodeNameChangeWeight / sumParameters);

			if (inPercent === true) {
				return (weightedAvg * 100).toFixed(2) + "%";
			} else {
				return weightedAvg;
			}
		} else {
			return "N/A";
		}
	}

	max1(value) {
		if (value === 'undefined' || value > 1)
			return 1;
		else
			return value;
	}
}