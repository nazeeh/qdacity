package com.qdacity.project.saturation;

public class SaturationResult {
    
    private final Long projectId;
    
    private double documentSaturation;
    private double codeSaturation;
    
    
    //TODO

    public SaturationResult(Long projectId) {
	this.projectId = projectId;
    }

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
    
    
}
