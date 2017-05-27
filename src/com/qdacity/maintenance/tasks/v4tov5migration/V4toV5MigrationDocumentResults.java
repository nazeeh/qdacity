package com.qdacity.maintenance.tasks.v4tov5migration;

import java.util.logging.Level;
import java.util.logging.Logger;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.api.taskqueue.DeferredTask;

public class V4toV5MigrationDocumentResults implements DeferredTask {

    @Override
    public void run() {
	migrateDocumentResults();

    }

    private void migrateDocumentResults() {
	DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
	//Column: paragraphAgreement -> reportRow (String) value: "<documentName>, <fmeasure>, <recall>, <precision>"
		Filter notNullFilter = new FilterPredicate("paragraphAgreement", FilterOperator.NOT_EQUAL, null);
		Iterable<Entity> docResults = V4toV5AgreementHelperMethods.getWithFilter("DocumentResult", notNullFilter, datastore);

	for (Entity result : docResults) {
	    try {
		//HINT: Problem: Class ParagraphAgreement does not exist any more. We need to deal with it manually.
		Entity paragraphAgreementEntity = V4toV5AgreementHelperMethods.getChildEntity(result, "paragraphAgreement", datastore);
				if (paragraphAgreementEntity != null) {
					String fmeasure = V4toV5AgreementHelperMethods.cleanForCsv((Double) paragraphAgreementEntity.getProperty("fMeasure"));
					String recall = V4toV5AgreementHelperMethods.cleanForCsv((Double) paragraphAgreementEntity.getProperty("recall"));
					String precision = V4toV5AgreementHelperMethods.cleanForCsv((Double) paragraphAgreementEntity.getProperty("precision"));

					String coderName = (String) result.getProperty("documentName");

					result.setProperty("reportRow", coderName + "," + fmeasure + "," + recall + "," + precision);
					result.removeProperty("name");
					result.removeProperty("paragraphAgreement");
					// TODO das ParagraphAgreement selbst muss man hier noch manuell l?schen!
					// persist changes
					datastore.put(result);
				}


	    } catch (Exception e) {
		Logger.getLogger("logger").log(Level.SEVERE, e.getMessage());
	    }
	}
    }

}
