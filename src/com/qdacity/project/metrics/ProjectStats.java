package com.qdacity.project.metrics;

import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.PrimaryKey;

import com.qdacity.project.saturation.SaturationResult;

@PersistenceCapable(
	identityType = IdentityType.APPLICATION)
public class ProjectStats {
	@PrimaryKey
	Long id;

	int documentCount;
	int codeCount;
	int codingCount;
	SaturationResult saturation;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public int getDocumentCount() {
		return documentCount;
	}

	public void setDocumentCount(int documentCount) {
		this.documentCount = documentCount;
	}

	public int getCodeCount() {
		return codeCount;
	}

	public void setCodeCount(int codeCount) {
		this.codeCount = codeCount;
	}

	public int getCodingCount() {
		return codingCount;
	}

	public void setCodingCount(int codingCount) {
		this.codingCount = codingCount;
	}

	public SaturationResult getSaturation() {
		return saturation;
	}

	public void setSaturation(SaturationResult saturation) {
		this.saturation = saturation;
	}

}
