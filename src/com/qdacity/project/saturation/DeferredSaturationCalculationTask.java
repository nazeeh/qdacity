package com.qdacity.project.saturation;

import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.jdo.PersistenceManager;

import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.taskqueue.DeferredTask;
import com.qdacity.PMF;
import com.qdacity.endpoint.SaturationEndpoint;

public class DeferredSaturationCalculationTask implements DeferredTask {

    private final Long projectId;

    public DeferredSaturationCalculationTask(Long projectId) {
	this.projectId = projectId;

    }

    @Override
    public void run() {
	PersistenceManager pmr = getPersistenceManager();
	SaturationCalculator sCalc;
	try {
	    Date epochStart = findEpochStart();

	    sCalc = new SaturationCalculator(projectId, epochStart);
	    SaturationResult saturationResult = sCalc.calculateSaturation(pmr);
	    pmr.makePersistent(saturationResult);
	} catch (UnauthorizedException ex) {
	    Logger.getLogger(DeferredSaturationCalculationTask.class.getName()).log(Level.SEVERE, null, ex);
	} finally {
	    pmr.close();
	}
    }

    private Date findEpochStart() throws UnauthorizedException {
	SaturationEndpoint se = new SaturationEndpoint();
	SaturationParameters sp = se.getSaturationParameters(projectId);
	int nthLast = sp.getLastSatResults();
	List<SaturationResult> saturationResults = se.getHistoricalSaturationResults(projectId, null);
	Collections.sort(saturationResults); //Sorts by creation time as SaturationResult implements comparable
	if (saturationResults.size() >= nthLast) {
	    return saturationResults.get(saturationResults.size() - nthLast).getCreationTime();
	}
	return new Date(0); //if there is no n-th last saturation result, we start from the very beginning of UNIX time;
    }

    private static PersistenceManager getPersistenceManager() {
	return PMF.get().getPersistenceManager();
    }

}
