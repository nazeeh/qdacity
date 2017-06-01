package com.qdacity.maintenance.tasks.v4tov5migration;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.taskqueue.DeferredTask;
import com.qdacity.project.metrics.EvaluationMethod;
import java.util.logging.Level;
import java.util.logging.Logger;

public class V5toV6MigrationValidationReports implements DeferredTask {

    @Override
    public void run() {
	DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
	Iterable<Entity> reports = V4toV5AgreementHelperMethods.getAll("ValidationReport", datastore);
	for (Entity report : reports) {
	    try{
	    //set new attribut
	    report.setProperty("evaluationMethod", EvaluationMethod.F_MEASURE.toString());
	    //Persist changes
	    datastore.put(report);
	    } catch (Exception e) {
		//catch Exception, log it, then continue
		Logger.getLogger("logger").log(Level.SEVERE, e.getMessage());
	    }
	}
    }

}
