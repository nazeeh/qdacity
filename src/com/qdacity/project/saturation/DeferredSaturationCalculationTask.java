package com.qdacity.project.saturation;

import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.taskqueue.DeferredTask;
import com.qdacity.PMF;
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
	try {
	    sCalc = new SaturationCalculator(projectId);
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
