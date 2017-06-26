package com.qdacity.project.saturation;

import com.google.api.server.spi.response.UnauthorizedException;
import com.qdacity.endpoint.ChangeEndpoint;
import com.qdacity.endpoint.SaturationEndpoint;
import com.qdacity.endpoint.TextDocumentEndpoint;
import com.qdacity.logs.Change;
import com.qdacity.logs.ChangeObject;
import java.util.Date;
import java.util.List;

public class SaturationCalculator {
    
    private final Long projectId;
    private final SaturationParameters params;
    private final List<Change> changes;
    
    public SaturationCalculator(Long projectId) throws UnauthorizedException {
	this.projectId = projectId;
	SaturationEndpoint se = new SaturationEndpoint();
	this.params = se.getSaturationParameters(projectId);
	//TODO get CHanges ab Zeitpunkt X! hier sind es immer alle changes!
	this.changes = new ChangeEndpoint().getAllChanges(projectId);
    }
    
    public SaturationResult calculateSaturation() {
	SaturationResult result = new SaturationResult();
	result.setProjectId(projectId);
	result.setSaturationParameters(params);
	
	double documentSaturation = calculateDocumentSaturation();
	result.setDocumentSaturation(documentSaturation);
	//documentSaturation is not weighted by itself!
	result.setDocumentSaturation(documentSaturation);
	
	//TODO weighting
	double codeSaturation = calculateCodeSaturation();
	result.setCodeSaturation(codeSaturation);
	
	//TODO
	double totalSaturation = 0.0; //TODO needs weighting!
	result.setTotalSaturation(totalSaturation);

	result.setCreationTime(new Date(System.currentTimeMillis()));
	return result;
    }
    
    private double calculateDocumentSaturation() {
	double numberOfNewDocuments = 0.0;
	for (Change change : changes) {
	    if (change.getObjectType().equals(ChangeObject.DOCUMENT)) {
		numberOfNewDocuments += 1.0;
	    }
	}
	double totalNumberOfDocuments = new TextDocumentEndpoint().countDocuments(projectId);
	double numberOfDocumentsBeforeChange = totalNumberOfDocuments - numberOfNewDocuments;
	
	return 1.0 - (numberOfNewDocuments / numberOfDocumentsBeforeChange);
	
    }
    
    private double calculateCodeSaturation() {
	//TODO
	return 0.0;
    }
    
}
