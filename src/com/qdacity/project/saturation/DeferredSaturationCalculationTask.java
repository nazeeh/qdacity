package com.qdacity.project.saturation;

import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.taskqueue.DeferredTask;
import com.qdacity.PMF;
import com.qdacity.endpoint.SaturationEndpoint;
import java.util.Date;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.jdo.PersistenceManager;

public class DeferredSaturationCalculationTask implements DeferredTask {

    private final Long projectId;

    public DeferredSaturationCalculationTask(Long projectId) {
	this.projectId = projectId;

    }

    @Override
    public void run() {
	PersistenceManager pmr = getPersistenceManager();
	SaturationCalculator sCalc;
	Date epochStart = new Date(0); //if there is no previous saturation result, we start from the very beginning
	SaturationEndpoint se = new SaturationEndpoint();
	List<SaturationResult> saturationResults = se.getHistoricalSaturationResults(projectId);
	for (SaturationResult sr : saturationResults) {
	    if (sr.getCreationTime().after(epochStart)) {
		epochStart = sr.getCreationTime();
	    }
	}

	try {
	    sCalc = new SaturationCalculator(projectId, epochStart);
	    SaturationResult saturationResult = sCalc.calculateSaturation();
	    pmr.makePersistent(saturationResult);
	} catch (UnauthorizedException ex) {
	    Logger.getLogger(DeferredSaturationCalculationTask.class.getName()).log(Level.SEVERE, null, ex);
	}
    }

    private static PersistenceManager getPersistenceManager() {
	return PMF.get().getPersistenceManager();
    }

}
