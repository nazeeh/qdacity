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

    @PrimaryKey
    @Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
    Key id;
    @Persistent
    Long projectId;

    @Persistent
    Date creationTime;

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

}
