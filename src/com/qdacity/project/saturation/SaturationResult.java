package com.qdacity.project.saturation;

import java.util.Date;
import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

@PersistenceCapable(identityType = IdentityType.APPLICATION)
public class SaturationResult {

    @PrimaryKey
    @Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
    Long id;
    @Persistent
    private Long projectId;

    @Persistent
    private double totalSaturation;

    @Persistent
    private double documentSaturation;
    @Persistent
    private double codeSaturation;
    @Persistent
    private Date creationTime;
    @Persistent(defaultFetchGroup = "true")
    private SaturationParameters saturationParameters; //As SaturationParameters can change over time, we need to keep track, which parameters were set here

    //TODO more attributes for more details
    public double getDocumentSaturation() {
	return documentSaturation;
    }

    public void setDocumentSaturation(double documentSaturation) {
	this.documentSaturation = documentSaturation;
    }

    public double getCodeSaturation() {
	return codeSaturation;
    }

    public void setCodeSaturation(double codeSaturation) {
	this.codeSaturation = codeSaturation;
    }

    public double getTotalSaturation() {
	return totalSaturation;
    }

    public void setTotalSaturation(double totalSaturation) {
	this.totalSaturation = totalSaturation;
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

}
