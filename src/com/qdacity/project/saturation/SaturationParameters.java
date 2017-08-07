package com.qdacity.project.saturation;

import com.google.appengine.api.datastore.Key;
import java.io.Serializable;
import java.util.Date;
import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

@PersistenceCapable(identityType = IdentityType.APPLICATION)
public class SaturationParameters implements Serializable {
    
    private static final int LAST_SAT_RESULT_MIN = 1;
    private static final int LAST_SAT_RESULT_MAX = 10;
    

    @PrimaryKey
    @Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
    Key id;
    @Persistent
    Long projectId;

    @Persistent
    Date creationTime;

    @Persistent
    int lastSatResults;

    //Document Changes
    @Persistent
    double insertDocumentChangeWeight;

    //Code Changes
    @Persistent
    double insertCodeChangeWeight;
    @Persistent
    double updateCodeAuthorChangeWeight;
    @Persistent
    double updateCodeColorChangeWeight;
    @Persistent
    double updateCodeMemoChangeWeight;
    @Persistent
    double updateCodeNameChangeWeight;
    @Persistent
    double updateCodeIdChangeWeight;
    @Persistent
    double relocateCodeChangeWeight;
    @Persistent
    double insertCodeRelationShipChangeWeight;
    @Persistent
    double deleteCodeRelationShipChangeWeight;
    @Persistent
    double deleteCodeChangeWeight;
    @Persistent
    double appliedCodesChangeWeight;

    //CodeBookEntry Changes
    @Persistent
    double updateCodeBookEntryDefinitionChangeWeight;
    @Persistent
    double updateCodeBookEntryExampleChangeWeight;
    @Persistent
    double updateCodeBookEntryShortDefinitionChangeWeight;
    @Persistent
    double updateCodeBookEntryWhenNotToUseChangeWeight;
    @Persistent
    double updateCodeBookEntryWhenToUseChangeWeight;

    //SATURATION MAXIMA
    //Document Changes
    @Persistent
    double insertDocumentSaturationMaximum;

    //Code Changes
    @Persistent
    double insertCodeSaturationMaximum;
    @Persistent
    double updateCodeAuthorSaturationMaximum;
    @Persistent
    double updateCodeColorSaturationMaximum;
    @Persistent
    double updateCodeMemoSaturationMaximum;
    @Persistent
    double updateCodeNameSaturationMaximum;
    @Persistent
    double updateCodeIdSaturationMaximum;
    @Persistent
    double relocateCodeSaturationMaximum;
    @Persistent
    double insertCodeRelationShipSaturationMaximum;
    @Persistent
    double deleteCodeRelationShipSaturationMaximum;
    @Persistent
    double deleteCodeSaturationMaximum;
    @Persistent
    double appliedCodesSaturationMaximum;

    //CodeBookEntry Changes
    @Persistent
    double updateCodeBookEntryDefinitionSaturationMaximum;
    @Persistent
    double updateCodeBookEntryExampleSaturationMaximum;
    @Persistent
    double updateCodeBookEntryShortDefinitionSaturationMaximum;
    @Persistent
    double updateCodeBookEntryWhenNotToUseSaturationMaximum;
    @Persistent
    double updateCodeBookEntryWhenToUseSaturationMaximum;

    public SaturationParameters() {
    }

    public SaturationParameters(SaturationParameters copy) {
	this.appliedCodesChangeWeight = copy.appliedCodesChangeWeight;
	this.creationTime = copy.creationTime;
	this.deleteCodeChangeWeight = copy.deleteCodeChangeWeight;
	this.deleteCodeRelationShipChangeWeight = copy.deleteCodeRelationShipChangeWeight;
	this.insertCodeChangeWeight = copy.insertCodeChangeWeight;
	this.insertCodeRelationShipChangeWeight = copy.insertCodeRelationShipChangeWeight;
	this.insertDocumentChangeWeight = copy.insertDocumentChangeWeight;
	this.projectId = copy.projectId;
	this.relocateCodeChangeWeight = copy.relocateCodeChangeWeight;
	this.updateCodeAuthorChangeWeight = copy.updateCodeAuthorChangeWeight;
	this.updateCodeBookEntryDefinitionChangeWeight = copy.updateCodeBookEntryDefinitionChangeWeight;
	this.updateCodeBookEntryExampleChangeWeight = copy.updateCodeBookEntryExampleChangeWeight;
	this.updateCodeBookEntryShortDefinitionChangeWeight = copy.updateCodeBookEntryShortDefinitionChangeWeight;
	this.updateCodeBookEntryWhenNotToUseChangeWeight = copy.updateCodeBookEntryWhenNotToUseChangeWeight;
	this.updateCodeBookEntryWhenToUseChangeWeight = copy.updateCodeBookEntryWhenToUseChangeWeight;
	this.updateCodeColorChangeWeight = copy.updateCodeColorChangeWeight;
	this.updateCodeIdChangeWeight = copy.updateCodeIdChangeWeight;
	this.updateCodeMemoChangeWeight = copy.updateCodeMemoChangeWeight;
	this.updateCodeNameChangeWeight = copy.updateCodeNameChangeWeight;
	this.appliedCodesSaturationMaximum = copy.appliedCodesSaturationMaximum;
	this.deleteCodeSaturationMaximum = copy.deleteCodeSaturationMaximum;
	this.deleteCodeRelationShipSaturationMaximum = copy.deleteCodeRelationShipSaturationMaximum;
	this.insertCodeSaturationMaximum = copy.insertCodeSaturationMaximum;
	this.insertCodeRelationShipSaturationMaximum = copy.insertCodeRelationShipSaturationMaximum;
	this.insertDocumentSaturationMaximum = copy.insertDocumentSaturationMaximum;
	this.relocateCodeSaturationMaximum = copy.relocateCodeSaturationMaximum;
	this.updateCodeAuthorSaturationMaximum = copy.updateCodeAuthorSaturationMaximum;
	this.updateCodeBookEntryDefinitionSaturationMaximum = copy.updateCodeBookEntryDefinitionSaturationMaximum;
	this.updateCodeBookEntryExampleSaturationMaximum = copy.updateCodeBookEntryExampleSaturationMaximum;
	this.updateCodeBookEntryShortDefinitionSaturationMaximum = copy.updateCodeBookEntryShortDefinitionSaturationMaximum;
	this.updateCodeBookEntryWhenNotToUseSaturationMaximum = copy.updateCodeBookEntryWhenNotToUseSaturationMaximum;
	this.updateCodeBookEntryWhenToUseSaturationMaximum = copy.updateCodeBookEntryWhenToUseSaturationMaximum;
	this.updateCodeColorSaturationMaximum = copy.updateCodeColorSaturationMaximum;
	this.updateCodeIdSaturationMaximum = copy.updateCodeIdSaturationMaximum;
	this.updateCodeMemoSaturationMaximum = copy.updateCodeMemoSaturationMaximum;
	this.updateCodeNameSaturationMaximum = copy.updateCodeNameSaturationMaximum;
	this.lastSatResults = copy.lastSatResults;
    }

    public int getLastSatResults() {
	return lastSatResults;
    }

    public void setLastSatResults(int lastSatResults) {
	if(lastSatResults > LAST_SAT_RESULT_MAX) {
	    lastSatResults = LAST_SAT_RESULT_MAX;
	}
	if(lastSatResults < LAST_SAT_RESULT_MIN) {
	    lastSatResults = LAST_SAT_RESULT_MIN;
	}
	this.lastSatResults = lastSatResults;
    }

    public Key getId() {
	return id;
    }

    public void setId(Key id) {
	this.id = id;
    }

    public Long getProjectId() {
	return projectId;
    }

    public void setProjectId(Long projectId) {
	this.projectId = projectId;
    }

    public double getInsertDocumentChangeWeight() {
	return insertDocumentChangeWeight;
    }

    public void setInsertDocumentChangeWeight(double insertDocumentChangeWeight) {
	this.insertDocumentChangeWeight = insertDocumentChangeWeight;
    }

    public double getInsertCodeChangeWeight() {
	return insertCodeChangeWeight;
    }

    public void setInsertCodeChangeWeight(double insertCodeChangeWeight) {
	this.insertCodeChangeWeight = insertCodeChangeWeight;
    }

    public double getUpdateCodeAuthorChangeWeight() {
	return updateCodeAuthorChangeWeight;
    }

    public void setUpdateCodeAuthorChangeWeight(double updateCodeAuthorChangeWeight) {
	this.updateCodeAuthorChangeWeight = updateCodeAuthorChangeWeight;
    }

    public double getUpdateCodeColorChangeWeight() {
	return updateCodeColorChangeWeight;
    }

    public void setUpdateCodeColorChangeWeight(double updateCodeColorChangeWeight) {
	this.updateCodeColorChangeWeight = updateCodeColorChangeWeight;
    }

    public double getUpdateCodeMemoChangeWeight() {
	return updateCodeMemoChangeWeight;
    }

    public void setUpdateCodeMemoChangeWeight(double updateCodeMemoChangeWeight) {
	this.updateCodeMemoChangeWeight = updateCodeMemoChangeWeight;
    }

    public double getUpdateCodeNameChangeWeight() {
	return updateCodeNameChangeWeight;
    }

    public void setUpdateCodeNameChangeWeight(double updateCodeNameChangeWeight) {
	this.updateCodeNameChangeWeight = updateCodeNameChangeWeight;
    }

    public double getUpdateCodeIdChangeWeight() {
	return updateCodeIdChangeWeight;
    }

    public void setUpdateCodeIdChangeWeight(double updateCodeIdChangeWeight) {
	this.updateCodeIdChangeWeight = updateCodeIdChangeWeight;
    }

    public double getDeleteCodeChangeWeight() {
	return deleteCodeChangeWeight;
    }

    public void setDeleteCodeChangeWeight(double deleteCodeChangeWeight) {
	this.deleteCodeChangeWeight = deleteCodeChangeWeight;
    }

    public double getUpdateCodeBookEntryDefinitionChangeWeight() {
	return updateCodeBookEntryDefinitionChangeWeight;
    }

    public void setUpdateCodeBookEntryDefinitionChangeWeight(double updateCodeBookEntryDefinitionChangeWeight) {
	this.updateCodeBookEntryDefinitionChangeWeight = updateCodeBookEntryDefinitionChangeWeight;
    }

    public double getUpdateCodeBookEntryExampleChangeWeight() {
	return updateCodeBookEntryExampleChangeWeight;
    }

    public void setUpdateCodeBookEntryExampleChangeWeight(double updateCodeBookEntryExampleChangeWeight) {
	this.updateCodeBookEntryExampleChangeWeight = updateCodeBookEntryExampleChangeWeight;
    }

    public double getUpdateCodeBookEntryShortDefinitionChangeWeight() {
	return updateCodeBookEntryShortDefinitionChangeWeight;
    }

    public void setUpdateCodeBookEntryShortDefinitionChangeWeight(double updateCodeBookEntryShortDefinitionChangeWeight) {
	this.updateCodeBookEntryShortDefinitionChangeWeight = updateCodeBookEntryShortDefinitionChangeWeight;
    }

    public double getUpdateCodeBookEntryWhenNotToUseChangeWeight() {
	return updateCodeBookEntryWhenNotToUseChangeWeight;
    }

    public void setUpdateCodeBookEntryWhenNotToUseChangeWeight(double updateCodeBookEntryWhenNotToUseChangeWeight) {
	this.updateCodeBookEntryWhenNotToUseChangeWeight = updateCodeBookEntryWhenNotToUseChangeWeight;
    }

    public double getUpdateCodeBookEntryWhenToUseChangeWeight() {
	return updateCodeBookEntryWhenToUseChangeWeight;
    }

    public void setUpdateCodeBookEntryWhenToUseChangeWeight(double updateCodeBookEntryWhenToUseChangeWeight) {
	this.updateCodeBookEntryWhenToUseChangeWeight = updateCodeBookEntryWhenToUseChangeWeight;
    }

    public Date getCreationTime() {
	return creationTime;
    }

    public void setCreationTime(Date creationTime) {
	this.creationTime = creationTime;
    }

    public double getRelocateCodeChangeWeight() {
	return relocateCodeChangeWeight;
    }

    public void setRelocateCodeChangeWeight(double relocateCodeChangeWeight) {
	this.relocateCodeChangeWeight = relocateCodeChangeWeight;
    }

    public double getInsertCodeRelationShipChangeWeight() {
	return insertCodeRelationShipChangeWeight;
    }

    public void setInsertCodeRelationShipChangeWeight(double insertCodeRelationShipChangeWeight) {
	this.insertCodeRelationShipChangeWeight = insertCodeRelationShipChangeWeight;
    }

    public double getDeleteCodeRelationShipChangeWeight() {
	return deleteCodeRelationShipChangeWeight;
    }

    public void setDeleteCodeRelationShipChangeWeight(double deleteCodeRelationShipChangeWeight) {
	this.deleteCodeRelationShipChangeWeight = deleteCodeRelationShipChangeWeight;
    }

    public double getAppliedCodesChangeWeight() {
	return appliedCodesChangeWeight;
    }

    public void setAppliedCodesChangeWeight(double appliedCodesChangeWeight) {
	this.appliedCodesChangeWeight = appliedCodesChangeWeight;
    }

    public double getInsertDocumentSaturationMaximum() {
	return insertDocumentSaturationMaximum;
    }

    public void setInsertDocumentSaturationMaximum(double insertDocumentSaturationMaximum) {
	this.insertDocumentSaturationMaximum = insertDocumentSaturationMaximum;
    }

    public double getInsertCodeSaturationMaximum() {
	return insertCodeSaturationMaximum;
    }

    public void setInsertCodeSaturationMaximum(double insertCodeSaturationMaximum) {
	this.insertCodeSaturationMaximum = insertCodeSaturationMaximum;
    }

    public double getUpdateCodeAuthorSaturationMaximum() {
	return updateCodeAuthorSaturationMaximum;
    }

    public void setUpdateCodeAuthorSaturationMaximum(double updateCodeAuthorSaturationMaximum) {
	this.updateCodeAuthorSaturationMaximum = updateCodeAuthorSaturationMaximum;
    }

    public double getUpdateCodeColorSaturationMaximum() {
	return updateCodeColorSaturationMaximum;
    }

    public void setUpdateCodeColorSaturationMaximum(double updateCodeColorSaturationMaximum) {
	this.updateCodeColorSaturationMaximum = updateCodeColorSaturationMaximum;
    }

    public double getUpdateCodeMemoSaturationMaximum() {
	return updateCodeMemoSaturationMaximum;
    }

    public void setUpdateCodeMemoSaturationMaximum(double updateCodeMemoSaturationMaximum) {
	this.updateCodeMemoSaturationMaximum = updateCodeMemoSaturationMaximum;
    }

    public double getUpdateCodeNameSaturationMaximum() {
	return updateCodeNameSaturationMaximum;
    }

    public void setUpdateCodeNameSaturationMaximum(double updateCodeNameSaturationMaximum) {
	this.updateCodeNameSaturationMaximum = updateCodeNameSaturationMaximum;
    }

    public double getUpdateCodeIdSaturationMaximum() {
	return updateCodeIdSaturationMaximum;
    }

    public void setUpdateCodeIdSaturationMaximum(double updateCodeIdSaturationMaximum) {
	this.updateCodeIdSaturationMaximum = updateCodeIdSaturationMaximum;
    }

    public double getRelocateCodeSaturationMaximum() {
	return relocateCodeSaturationMaximum;
    }

    public void setRelocateCodeSaturationMaximum(double relocateCodeSaturationMaximum) {
	this.relocateCodeSaturationMaximum = relocateCodeSaturationMaximum;
    }

    public double getInsertCodeRelationShipSaturationMaximum() {
	return insertCodeRelationShipSaturationMaximum;
    }

    public void setInsertCodeRelationShipSaturationMaximum(double insertCodeRelationShipSaturationMaximum) {
	this.insertCodeRelationShipSaturationMaximum = insertCodeRelationShipSaturationMaximum;
    }

    public double getDeleteCodeRelationShipSaturationMaximum() {
	return deleteCodeRelationShipSaturationMaximum;
    }

    public void setDeleteCodeRelationShipSaturationMaximum(double deleteCodeRelationShipSaturationMaximum) {
	this.deleteCodeRelationShipSaturationMaximum = deleteCodeRelationShipSaturationMaximum;
    }

    public double getDeleteCodeSaturationMaximum() {
	return deleteCodeSaturationMaximum;
    }

    public void setDeleteCodeSaturationMaximum(double deleteCodeSaturationMaximum) {
	this.deleteCodeSaturationMaximum = deleteCodeSaturationMaximum;
    }

    public double getAppliedCodesSaturationMaximum() {
	return appliedCodesSaturationMaximum;
    }

    public void setAppliedCodesSaturationMaximum(double appliedCodesSaturationMaximum) {
	this.appliedCodesSaturationMaximum = appliedCodesSaturationMaximum;
    }

    public double getUpdateCodeBookEntryDefinitionSaturationMaximum() {
	return updateCodeBookEntryDefinitionSaturationMaximum;
    }

    public void setUpdateCodeBookEntryDefinitionSaturationMaximum(double updateCodeBookEntryDefinitionSaturationMaximum) {
	this.updateCodeBookEntryDefinitionSaturationMaximum = updateCodeBookEntryDefinitionSaturationMaximum;
    }

    public double getUpdateCodeBookEntryExampleSaturationMaximum() {
	return updateCodeBookEntryExampleSaturationMaximum;
    }

    public void setUpdateCodeBookEntryExampleSaturationMaximum(double updateCodeBookEntryExampleSaturationMaximum) {
	this.updateCodeBookEntryExampleSaturationMaximum = updateCodeBookEntryExampleSaturationMaximum;
    }

    public double getUpdateCodeBookEntryShortDefinitionSaturationMaximum() {
	return updateCodeBookEntryShortDefinitionSaturationMaximum;
    }

    public void setUpdateCodeBookEntryShortDefinitionSaturationMaximum(double updateCodeBookEntryShortDefinitionSaturationMaximum) {
	this.updateCodeBookEntryShortDefinitionSaturationMaximum = updateCodeBookEntryShortDefinitionSaturationMaximum;
    }

    public double getUpdateCodeBookEntryWhenNotToUseSaturationMaximum() {
	return updateCodeBookEntryWhenNotToUseSaturationMaximum;
    }

    public void setUpdateCodeBookEntryWhenNotToUseSaturationMaximum(double updateCodeBookEntryWhenNotToUseSaturationMaximum) {
	this.updateCodeBookEntryWhenNotToUseSaturationMaximum = updateCodeBookEntryWhenNotToUseSaturationMaximum;
    }

    public double getUpdateCodeBookEntryWhenToUseSaturationMaximum() {
	return updateCodeBookEntryWhenToUseSaturationMaximum;
    }

    public void setUpdateCodeBookEntryWhenToUseSaturationMaximum(double updateCodeBookEntryWhenToUseSaturationMaximum) {
	this.updateCodeBookEntryWhenToUseSaturationMaximum = updateCodeBookEntryWhenToUseSaturationMaximum;
    }

}
