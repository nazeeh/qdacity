package com.qdacity.maintenance.tasks.v4tov5migration;

import java.util.logging.Level;
import java.util.logging.Logger;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.taskqueue.DeferredTask;

public class V4toV5MigrationValidationResults implements DeferredTask {

    @Override
    public void run() {
	migrateValidationResults();
    }

    private void migrateValidationResults() {
	DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
	//Column: paragraphAgreement -> reportRow (String) value: "<coderName>, <fmeasure>, <recall>, <precision>"
	Iterable<Entity> validationResults = V4toV5AgreementHelperMethods.getAll("ValidationResult", datastore);
	for (Entity result : validationResults) {
	    try {
		//HINT: Problem: Class ParagraphAgreement does not exist any more. We need to deal with it manually.
		Entity paragraphAgreementEntity = V4toV5AgreementHelperMethods.getChildEntity(result, "paragraphAgreement", datastore);
		String fmeasure = V4toV5AgreementHelperMethods.cleanForCsv((Double) paragraphAgreementEntity.getProperty("fMeasure"));
		String recall = V4toV5AgreementHelperMethods.cleanForCsv((Double) paragraphAgreementEntity.getProperty("recall"));
		String precision = V4toV5AgreementHelperMethods.cleanForCsv((Double) paragraphAgreementEntity.getProperty("precision"));

		String coderName = (String) result.getProperty("name");

		result.setProperty("reportRow", coderName + "," + fmeasure + "," + recall + "," + precision);
		result.removeProperty("name");
		result.removeProperty("paragraphAgreement");
		//TODO das ParagraphAgreement selbst muss man hier noch manuell l?schen!
		//Persist changes
		datastore.put(result);
	    } catch (Exception e) {
		Logger.getLogger("logger").log(Level.SEVERE, e.getMessage());
	    }
	}
    }

}
