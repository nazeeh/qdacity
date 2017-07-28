package com.qdacity.project.saturation;

import java.util.Date;

public class DefaultSaturationParameters extends SaturationParameters {

    //TODO this is a hardcoded soultion which requires rebuilding the application if it gets changed...
    public DefaultSaturationParameters() {
	this.creationTime = new Date(System.currentTimeMillis());

	//TODO these values are set randomly just for a first test!
	//Document Changes
	this.insertDocumentChangeWeight = 0;
	//Code Changes
	this.insertCodeChangeWeight = 1.0;
	this.updateCodeAuthorChangeWeight = 0.01;
	this.updateCodeColorChangeWeight = 0.5;
	this.updateCodeMemoChangeWeight = 0.7;
	this.updateCodeNameChangeWeight = 0.7;
	this.updateCodeIdChangeWeight = 0.01;
	this.relocateCodeChangeWeight = 0.9;
	this.insertCodeRelationShipChangeWeight = 0.5;
	this.deleteCodeRelationShipChangeWeight = 0.5;
	this.deleteCodeChangeWeight = 1.0;
	this.appliedCodesChangeWeight = 0.01;
	//CodeBookEntry Changes
	this.updateCodeBookEntryDefinitionChangeWeight = 1.0;
	this.updateCodeBookEntryExampleChangeWeight = 0.5;
	this.updateCodeBookEntryShortDefinitionChangeWeight = 1.0;
	this.updateCodeBookEntryWhenNotToUseChangeWeight = 0.5;
	this.updateCodeBookEntryWhenToUseChangeWeight = 0.7;
	
	
	this.lastSatResults = 3;
	
	//TODO set them all!
	this.insertDocumentSaturationMaximum = 1;
	//Code Changes
	this.insertCodeSaturationMaximum = 1.0;
	this.updateCodeAuthorSaturationMaximum = 0.01;
	this.updateCodeColorSaturationMaximum = 0.5;
	this.updateCodeMemoSaturationMaximum = 0.7;
	this.updateCodeNameSaturationMaximum = 0.7;
	this.updateCodeIdSaturationMaximum = 0.01;
	this.relocateCodeSaturationMaximum = 0.9;
	this.insertCodeRelationShipSaturationMaximum = 0.5;
	this.deleteCodeRelationShipSaturationMaximum = 0.5;
	this.deleteCodeSaturationMaximum = 1.0;
	this.appliedCodesSaturationMaximum = 0.01;
	//CodeBookEntry Changes
	this.updateCodeBookEntryDefinitionSaturationMaximum = 1.0;
	this.updateCodeBookEntryExampleSaturationMaximum = 0.5;
	this.updateCodeBookEntryShortDefinitionSaturationMaximum = 1.0;
	this.updateCodeBookEntryWhenNotToUseSaturationMaximum = 0.5;
	this.updateCodeBookEntryWhenToUseSaturationMaximum = 0.7;
	
	
    }

}
