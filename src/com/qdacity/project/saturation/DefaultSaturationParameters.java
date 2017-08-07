package com.qdacity.project.saturation;

import java.util.Date;

public class DefaultSaturationParameters extends SaturationParameters {

    public DefaultSaturationParameters() {
	this.creationTime = new Date(System.currentTimeMillis());
	this.lastSatResults = 3; // This is the number of intervals used for saturation calculation. Three seems to be a reasonable period of time, but it highly depends on the usage of the saturation feature by the users.

	//Hint: The set values here are subject to further research
	// Research Question: Which preset fits best to most of the QDAcity use cases?
	//___________________________
	//___________________________
	//All values here were set following this guideline:
	// - How much impact has this change on the theory building out of the code system?
	// - Is this change relevant for theoretical saturation?
	//____________________________
	setSaturationWeights();
	setSaturationMaxima();

    }

    private void setSaturationWeights() {
	//===== SATURATION WEIGHTS =============
	//Question: How important is this change type for the average saturation?
	//Document Changes
	this.insertDocumentChangeWeight = 0.0; //this is more related to data / topic saturation than theoretical saturation
	//Code Changes
	this.insertCodeChangeWeight = 1.0; //definitely important as it changes the code system
	this.updateCodeAuthorChangeWeight = 0.0; //does not have impact on the theory
	this.updateCodeColorChangeWeight = 0.0; //does not habe impact on the theory
	this.updateCodeMemoChangeWeight = 0.5; //depending on usage of this attribute it could be important for theory
	this.updateCodeNameChangeWeight = 1.0; //definitely important
	this.relocateCodeChangeWeight = 1.0; //Changes the structure of the code system - very important
	this.insertCodeRelationShipChangeWeight = 0.75; //Doesn't change the overall structure but contains important meta information
	this.deleteCodeRelationShipChangeWeight = 0.75; //Doesn't change the overall structure but removes important meta information
	this.deleteCodeChangeWeight = 1.0; //definitely important as it changes the code system
	this.appliedCodesChangeWeight = 0.2; //This mostly shows the activity of coding. These changes usually cause other changes.
	//CodeBookEntry Changes
	this.updateCodeBookEntryDefinitionChangeWeight = 1.0; //It is almost as important as a Code Name Change
	this.updateCodeBookEntryExampleChangeWeight = 0.75; //It usually clarifies in which context a code should be used. This is quite important
	this.updateCodeBookEntryShortDefinitionChangeWeight = 1.0; //Same as Definition Change
	this.updateCodeBookEntryWhenNotToUseChangeWeight = 0.75;//It usually clarifies in which context a code should be used. This is quite important
	this.updateCodeBookEntryWhenToUseChangeWeight = 0.75;//It usually clarifies in which context a code should be used. This is quite important
    }

    private void setSaturationMaxima() {
	//===== SATURATION MAXIMA =============
	//Here the question is:
	//In order to reach 100% saturation, should a change like this still appear? 
	//If not it needs to be 1.0 (100%) stable otherwise we can be a little lower.
	this.insertDocumentSaturationMaximum = 1; //Default weight is set to 0, so this should be 1, in case a user edits the weight they want to see something immediately
	//Code Changes
	this.insertCodeSaturationMaximum = 1.0; //usually there should not be a new Code in a stable code system, saturation here should be 100%
	this.updateCodeAuthorSaturationMaximum = 0.1; //It really is not that important, but if a user changes the weight, there should be a result visible here
	this.updateCodeColorSaturationMaximum = 0.1; //same as AuthorSaturationMaximum
	this.updateCodeMemoSaturationMaximum = 0.9; //This attribute can be used to clarify the theory building, so some changes here should be ok
	this.updateCodeNameSaturationMaximum = 1.0; //usually a code name change is a hint for a not stable code system
	this.relocateCodeSaturationMaximum = 1.0; //relocating codes changes the overall code system so it should be 100% stable
	this.insertCodeRelationShipSaturationMaximum = 0.95; //It is mostly meta information, where slight changes are possible in a stable code system
	this.deleteCodeRelationShipSaturationMaximum = 0.95; //same as insert Code relationship
	this.deleteCodeSaturationMaximum = 1.0; //changes the code system and should not happen in a stable code system0
	this.appliedCodesSaturationMaximum = 0.75; //Applying codes can possibly trigger other changes, but can also be used to proof that the code system is stable.
	//CodeBookEntry Changes
	this.updateCodeBookEntryDefinitionSaturationMaximum = 1.0; //same as code name change
	this.updateCodeBookEntryExampleSaturationMaximum = 0.9; //example can be changed, but may not affect the usage
	this.updateCodeBookEntryShortDefinitionSaturationMaximum = 1.0; //same as definition
	this.updateCodeBookEntryWhenNotToUseSaturationMaximum = 0.9;//same as example
	this.updateCodeBookEntryWhenToUseSaturationMaximum = 0.9;//same as example
    }

}
