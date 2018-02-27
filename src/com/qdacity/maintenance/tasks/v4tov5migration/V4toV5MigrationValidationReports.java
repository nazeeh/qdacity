package com.qdacity.maintenance.tasks.v4tov5migration;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.taskqueue.DeferredTask;
import com.qdacity.project.metrics.TabularReportRow;
import java.util.logging.Level;
import java.util.logging.Logger;

public class V4toV5MigrationValidationReports implements DeferredTask {

    @Override
    public void run() {
	migrateValidationReports();
    }

    private void migrateValidationReports() {
	DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		TabularReportRow standardFMeasureHeader = V4toV5AgreementHelperMethods.createStandardFMeasureHeader();
	//Column: paragraphAgreement -> avgAgreement (String) value: "Average, <fmeasure>, <recall>, <precision>"
	//New column: avgAgreementHead (String) value: "Coder,FMeasure,Recall,Precision"
	//New column: detailedAgreementHead (String) value: "Coder,FMeasure,Recall,Precision"
	//New column: evaluationUnit (String) value: "paragraph"
	Iterable<Entity> reports = V4toV5AgreementHelperMethods.getAll("ValidationReport", datastore);
	for (Entity report : reports) {
	    try {
		if (report != null) {
		    Logger.getLogger("logger").log(Level.INFO, "Report " + report.getProperty("name") + " report: " + report);
		}
		//HINT: Problem: Class ParagraphAgreement does not exist any more. We need to deal with it manually.
		Entity avgParagraphAgreementEntity = V4toV5AgreementHelperMethods.getChildEntity(report, "paragraphAgreement", datastore);
		Logger.getLogger("logger").log(Level.INFO, "Reports avgParagraphAgreement: " + avgParagraphAgreementEntity);
		Logger.getLogger("logger").log(Level.INFO, "Updating ParagraphAgreement: " + avgParagraphAgreementEntity.getKey());

		String fmeasure = V4toV5AgreementHelperMethods.cleanForCsv((Double) avgParagraphAgreementEntity.getProperty("fMeasure"));
		String recall = V4toV5AgreementHelperMethods.cleanForCsv((Double) avgParagraphAgreementEntity.getProperty("recall"));
		String precision = V4toV5AgreementHelperMethods.cleanForCsv((Double) avgParagraphAgreementEntity.getProperty("precision"));

		Logger.getLogger("logger").log(Level.INFO, "reportRow.setProperty('reportRow', 'Average," + fmeasure + "," + recall + "," + precision + "')");
		report.setProperty("avgAgreement", "Average," + fmeasure + "," + recall + "," + precision);
		report.setProperty("evaluationUnit", "paragraph");
		report.setProperty("avgAgreementHead", standardFMeasureHeader.toString());
		report.setProperty("detailedAgreementHead", standardFMeasureHeader.toString());
		Logger.getLogger("logger").log(Level.INFO, "report.removeProperty(\"paragraphAgreement\");");
		report.removeProperty("paragraphAgreement"); //muss man das tun?
		//TODO das ParagraphAgreement selbst muss man hier noch manuell l?schen!
		datastore.delete(avgParagraphAgreementEntity.getKey());
		//Persist changes
		datastore.put(report);
	    } catch (Exception e) {
		Logger.getLogger("logger").log(Level.SEVERE, e.getMessage());
	    }
	}
    }
}
