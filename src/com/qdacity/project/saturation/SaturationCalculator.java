package com.qdacity.project.saturation;

import com.google.api.server.spi.response.UnauthorizedException;
import com.qdacity.endpoint.ChangeEndpoint;
import com.qdacity.endpoint.SaturationEndpoint;
import com.qdacity.logs.Change;
import java.util.List;

public class SaturationCalculator {
    
    private final Long projectId;
    private final SaturationParameters params;
    private final List<Change> changes;

    public SaturationCalculator(Long projectId) throws UnauthorizedException {
	this.projectId = projectId;
	SaturationEndpoint se = new SaturationEndpoint();
	this.params = se.getSaturationParameters(projectId);
	this.changes = new ChangeEndpoint().getAllChanges(projectId);
    }
    
    
    
    public SaturationResult calculateSaturation() {
	SaturationResult result = new SaturationResult(projectId);
	
	double documentSaturation = calculateDocumentSaturation();
	
	double codeSaturation = calculateCodeSaturation();

	return result;
    }

    private double calculateDocumentSaturation() {
	//TODO
    }

    private double calculateCodeSaturation() {
	//TODO
    }
    
}
