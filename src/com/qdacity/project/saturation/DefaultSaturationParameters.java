package com.qdacity.project.saturation;

import java.util.Date;

public class DefaultSaturationParameters extends SaturationParameters {

    public DefaultSaturationParameters() {
	this.creationTime = new Date(System.currentTimeMillis());

	//Hint: The set values here are subject to further research
	// Research Question: Which preset fits best to most of the QDAcity use cases?
	
	//All values here were set following this guideline:
	// - How much impact has this change on the theory building out of the code system
	// - Is this change relevant for theoretical saturation
	
	//Document Changes
	this.insertDocumentChangeWeight = 0; //this is more related to data / topic saturation than theoretical saturation
	//Code Changes
	this.insertCodeChangeWeight = 1.0; //definitely important as it changes the code system
	this.updateCodeAuthorChangeWeight = 0.0; //does not have impact on the theory
	this.updateCodeColorChangeWeight = 0.0; //does not habe impact on the theory
	this.updateCodeMemoChangeWeight = 0.5; //depending on usage of this attribute it could be important for theory
	this.updateCodeNameChangeWeight = 1.0; //definitely important
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
