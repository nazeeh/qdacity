package com.qdacity.project.saturation;

import java.util.Date;
import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

/**
 * Contains the unweighted saturations in the different categories. For
 * calculation of an average (on the fronend) use the saturationParameters which
 * are a childEntity
 */
@PersistenceCapable(identityType = IdentityType.APPLICATION)
public class SaturationResult implements Comparable<SaturationResult> {

    @PrimaryKey
    @Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
    Long id;
    @Persistent
    private Long projectId;

    @Persistent
    private double insertDocumentSaturation;
    @Persistent
    private double insertCodeSaturation;
    @Persistent
    private double updateCodeAuthorSaturation;
    @Persistent
    private double updateCodeColorSaturation;
    @Persistent
    private double updateCodeMemoSaturation;
    @Persistent
    private double updateCodeNameSaturation;
    @Persistent
    private double updateCodeIdSaturation;
    @Persistent
    private double relocateCodeSaturation;
    @Persistent
    private double deleteCodeSaturation;
    @Persistent
    private double applyCodeSaturation;
    @Persistent
    private double insertCodeRelationShipSaturation;
    @Persistent
    private double deleteCodeRelationShipSaturation;
    @Persistent
    private double updateCodeBookEntryDefinitionSaturation;
    @Persistent
    private double updateCodeBookEntryExampleSaturation;
    @Persistent
    private double updateCodeBookEntryShortDefinitionSaturation;
    @Persistent
    private double updateCodeBookEntryWhenNotToUseSaturation;
    @Persistent
    private double updateCodeBookEntryWhenToUseSaturation;

    @Persistent
    private Date creationTime; //this is the maximum date for changes analyzed at the same time
    @Persistent
    private Date evaluationStartDate;
    @Persistent(
		defaultFetchGroup = "true")
    private SaturationParameters saturationParameters; //As SaturationParameters can change over time, we need to keep track, which parameters were set here

    public double getDocumentSaturation() {
	return insertDocumentSaturation;
    }

    public void setDocumentSaturation(double documentSaturation) {
	this.insertDocumentSaturation = documentSaturation;
    }

    public SaturationParameters getSaturationParameters() {
	return saturationParameters;
    }

    public void setSaturationParameters(SaturationParameters saturationParameters) {
	this.saturationParameters = saturationParameters;
    }

    public Long getId() {
	return id;
    }

    public void setId(Long id) {
	this.id = id;
    }

    public Long getProjectId() {
	return projectId;
    }

    public void setProjectId(Long projectId) {
	this.projectId = projectId;
    }

    public Date getCreationTime() {
	return creationTime;
    }

    public void setCreationTime(Date creationTime) {
	this.creationTime = creationTime;
    }

    public double getInsertCodeSaturation() {
	return insertCodeSaturation;
    }

    public void setInsertCodeSaturation(double insertCodeSaturation) {
	this.insertCodeSaturation = insertCodeSaturation;
    }

    public double getUpdateCodeAuthorSaturation() {
	return updateCodeAuthorSaturation;
    }

    public void setUpdateCodeAuthorSaturation(double updateCodeAuthorSaturation) {
	this.updateCodeAuthorSaturation = updateCodeAuthorSaturation;
    }

    public double getUpdateCodeColorSaturation() {
	return updateCodeColorSaturation;
    }

    public void setUpdateCodeColorSaturation(double updateCodeColorSaturation) {
	this.updateCodeColorSaturation = updateCodeColorSaturation;
    }

    public double getUpdateCodeMemoSaturation() {
	return updateCodeMemoSaturation;
    }

    public void setUpdateCodeMemoSaturation(double updateCodeMemoSaturation) {
	this.updateCodeMemoSaturation = updateCodeMemoSaturation;
    }

    public double getUpdateCodeNameSaturation() {
	return updateCodeNameSaturation;
    }

    public void setUpdateCodeNameSaturation(double updateCodeNameSaturation) {
	this.updateCodeNameSaturation = updateCodeNameSaturation;
    }

    public double getUpdateCodeIdSaturation() {
	return updateCodeIdSaturation;
    }

    public void setUpdateCodeIdSaturation(double updateCodeIdSaturation) {
	this.updateCodeIdSaturation = updateCodeIdSaturation;
    }

    public double getRelocateCodeSaturation() {
	return relocateCodeSaturation;
    }

    public void setRelocateCodeSaturation(double relocateCodeSaturation) {
	this.relocateCodeSaturation = relocateCodeSaturation;
    }

    public double getDeleteCodeSaturation() {
	return deleteCodeSaturation;
    }

    public void setDeleteCodeSaturation(double deleteCodeSaturation) {
	this.deleteCodeSaturation = deleteCodeSaturation;
    }

    public double getInsertCodeRelationShipSaturation() {
	return insertCodeRelationShipSaturation;
    }

    public void setInsertCodeRelationShipSaturation(double insertCodeRelationShipSaturation) {
	this.insertCodeRelationShipSaturation = insertCodeRelationShipSaturation;
    }

    public double getDeleteCodeRelationShipSaturation() {
	return deleteCodeRelationShipSaturation;
    }

    public void setDeleteCodeRelationShipSaturation(double deleteCodeRelationShipSaturation) {
	this.deleteCodeRelationShipSaturation = deleteCodeRelationShipSaturation;
    }

    public double getUpdateCodeBookEntryDefinitionSaturation() {
	return updateCodeBookEntryDefinitionSaturation;
    }

    public void setUpdateCodeBookEntryDefinitionSaturation(double updateCodeBookEntryDefinitionSaturation) {
	this.updateCodeBookEntryDefinitionSaturation = updateCodeBookEntryDefinitionSaturation;
    }

    public double getUpdateCodeBookEntryExampleSaturation() {
	return updateCodeBookEntryExampleSaturation;
    }

    public void setUpdateCodeBookEntryExampleSaturation(double updateCodeBookEntryExampleSaturation) {
	this.updateCodeBookEntryExampleSaturation = updateCodeBookEntryExampleSaturation;
    }

    public double getUpdateCodeBookEntryShortDefinitionSaturation() {
	return updateCodeBookEntryShortDefinitionSaturation;
    }

    public void setUpdateCodeBookEntryShortDefinitionSaturation(double updateCodeBookEntryShortDefinitionSaturation) {
	this.updateCodeBookEntryShortDefinitionSaturation = updateCodeBookEntryShortDefinitionSaturation;
    }

    public double getUpdateCodeBookEntryWhenNotToUseSaturation() {
	return updateCodeBookEntryWhenNotToUseSaturation;
    }

    public void setUpdateCodeBookEntryWhenNotToUseSaturation(double updateCodeBookEntryWhenNotToUseSaturation) {
	this.updateCodeBookEntryWhenNotToUseSaturation = updateCodeBookEntryWhenNotToUseSaturation;
    }

    public double getUpdateCodeBookEntryWhenToUseSaturation() {
	return updateCodeBookEntryWhenToUseSaturation;
    }

    public void setUpdateCodeBookEntryWhenToUseSaturation(double updateCodeBookEntryWhenToUseSaturation) {
	this.updateCodeBookEntryWhenToUseSaturation = updateCodeBookEntryWhenToUseSaturation;
    }

    public Date getEvaluationStartDate() {
	return evaluationStartDate;
    }

    public void setEvaluationStartDate(Date evaluationStartDate) {
	this.evaluationStartDate = new Date(evaluationStartDate.getTime());
    }

    public double getApplyCodeSaturation() {
	return applyCodeSaturation;
    }

    public void setApplyCodeSaturation(double applyCodeSaturation) {
	this.applyCodeSaturation = applyCodeSaturation;
    }

    @Override
    public int compareTo(SaturationResult t) {
	if (getCreationTime() == null) {
	    return -1;
	}
	if (t == null || t.getCreationTime() == null) {
	    return 1;
	}
	return getCreationTime().compareTo(t.getCreationTime());
    }

}
