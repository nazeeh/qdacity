package com.qdacity.endpoint;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.users.User;
import com.qdacity.Constants;
import com.qdacity.PMF;
import com.qdacity.project.metrics.TabularValidationReportRow;
import java.util.ArrayList;
import java.util.List;
import javax.jdo.PersistenceManager;

/**
 * This Endpoint is intented to be used for Data migration when changes in the
 * data model need to be applied in a given dataset. Use this Endpoint with
 * care!
 */
@Api(
	name = "qdacity",
	version = Constants.VERSION,
	namespace = @ApiNamespace(
		ownerDomain = "qdacity.com",
		ownerName = "qdacity.com",
		packagePath = "server.project"))
public class DataMigrationEndpoint {

    /**
     *
     * @param user Make sure your user has the rights to perform all DataStore
     * Operations!
     */
    @ApiMethod(
	    name = "migration.migrateV4toV5",
	    scopes = {Constants.EMAIL_SCOPE},
	    clientIds = {Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
	    audiences = {Constants.WEB_CLIENT_ID})
    public void migrateV4toV5(User user) {
	//TODO Run everything in taskQUeues!!
	//assumption: Data only contains ValidationReports that have run an FMeasure!
	DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
	migrateValidationReports(user, datastore); //TODO replace with V4toV5MigrationValidationReports Task
	migrateDocumentResults(user, datastore); //TODO replace with V4toV5MigrationDocumentResults Task
	migrateValidationResults(user, datastore); //TODO replace with V4toV5MigrationValidationResults Task
	//Needs to be done last, as others used ParagraphAgreement
	//TODO replace with V4toV5MigrationParagraphAgreements Task
	//migrateParagraphAgreements(user, datastore); //Gibt es überhaupt "freie" ParagraphAgreements? Oder sind schon alle abgefertigt mit den ersten drei Schritten?
    }

    private static PersistenceManager getPersistenceManager() {
	return PMF.get().getPersistenceManager();
    }

    private void migrateValidationReports(User user, DatastoreService datastore) {
	TabularValidationReportRow standardFMeasureHeader = createStandardFMeasureHeader();
	//Column: paragraphAgreement -> avgAgreement (String) value: "Average, <fmeasure>, <recall>, <precision>"
	//New column: avgAgreementHead (String) value: "Coder,FMeasure,Recall,Precision"
	//New column: detailedAgreementHead (String) value: "Coder,FMeasure,Recall,Precision"
	//New column: evaluationUnit (String) value: "paragraph"
	Iterable<Entity> reports = getAll("ValidationReport", datastore);
	for (Entity report : reports) {
	    //HINT: Problem: Class ParagraphAgreement does not exist any more. We need to deal with it manually.
	    Entity avgParagraphAgreementEntity = (Entity) report.getProperty("paragraphAgreement"); //TODO funktioniert das überhaupt so?
	    String fmeasure = cleanForCsv((String) avgParagraphAgreementEntity.getProperty("fmeasure"));
	    String recall = cleanForCsv((String) avgParagraphAgreementEntity.getProperty("recall"));
	    String precision = cleanForCsv((String) avgParagraphAgreementEntity.getProperty("precision"));

	    report.setProperty("reportRow", "Average," + fmeasure + "," + recall + "," + precision);
	    report.setProperty("evaluationUnit", "paragraph");
	    report.setProperty("avgAgreementHead", standardFMeasureHeader.toString());
	    report.setProperty("detailedAgreementHead", standardFMeasureHeader.toString());
	    report.removeProperty("paragraphAgreement"); //muss man das tun?
	    //TODO das ParagraphAgreement selbst muss man hier noch löschen! (oder passiert das automatisch?)
	    datastore.delete(avgParagraphAgreementEntity.getKey());
	}
	//Persist all changes at once
	datastore.put(reports);
    }

    private void migrateDocumentResults(User user, DatastoreService datastore) {
	//Column: paragraphAgreement -> reportRow (String) value: "<documentName>, <fmeasure>, <recall>, <precision>"
	Iterable<Entity> docResults = getAll("DocumentResult", datastore);
	for (Entity result : docResults) {
	    //HINT: Problem: Class ParagraphAgreement does not exist any more. We need to deal with it manually.
	    Entity paragraphAgreementEntity = (Entity) result.getProperty("paragraphAgreement"); //TODO funktioniert das überhaupt so?
	    String fmeasure = cleanForCsv((String) paragraphAgreementEntity.getProperty("fmeasure"));
	    String recall = cleanForCsv((String) paragraphAgreementEntity.getProperty("recall"));
	    String precision = cleanForCsv((String) paragraphAgreementEntity.getProperty("precision"));

	    String coderName = (String) result.getProperty("name");

	    result.setProperty("reportRow", coderName + "," + fmeasure + "," + recall + "," + precision);
	    result.removeProperty("name");
	    result.removeProperty("paragraphAgreement");
	    //TODO das ParagraphAgreement selbst muss man hier noch löschen! (oder passiert das automatisch?)
	}
	//Persist all changes at once
	datastore.put(docResults);
    }

    private void migrateValidationResults(User user, DatastoreService datastore) {
	//Column: paragraphAgreement -> reportRow (String) value: "<coderName>, <fmeasure>, <recall>, <precision>"
	Iterable<Entity> validationResults = getAll("ValidationResult", datastore);
	for (Entity result : validationResults) {

	    //HINT: Problem: Class ParagraphAgreement does not exist any more. We need to deal with it manually.
	    Entity paragraphAgreementEntity = (Entity) result.getProperty("paragraphAgreement"); //TODO funktioniert das überhaupt so?
	    String fmeasure = cleanForCsv((String) paragraphAgreementEntity.getProperty("fmeasure"));
	    String recall = cleanForCsv((String) paragraphAgreementEntity.getProperty("recall"));
	    String precision = cleanForCsv((String) paragraphAgreementEntity.getProperty("precision"));

	    String coderName = (String) result.getProperty("name");

	    result.setProperty("reportRow", coderName + "," + fmeasure + "," + recall + "," + precision);
	    result.removeProperty("name");
	    result.removeProperty("paragraphAgreement");
	    //TODO das ParagraphAgreement selbst muss man hier noch löschen! (oder passiert das automatisch?)

	}
	//Persist all changes at once
	datastore.put(validationResults); //Funktioniert das so?
    }
/*
    private void migrateParagraphAgreements(User user, DatastoreService datastore) {
	//TODO all ParagraphAgreement -> TabularValidationReportRow
	//As the Entity name changed this method looks different from the ones above!
	//HINT: as the class ParagraphAgreement has been renamed to FMeasureResult we need to access it manually in the DataStore.
	for (Entity result : getAll("ParagraphAgreement", datastore)) {
	    String fmeasure = (String) result.getProperty("fmeasure");
	    String recall = (String) result.getProperty("recall");
	    String precision = (String) result.getProperty("precision");
	    Key key = result.getKey();
	    Key parent = result.getParent();

	    List<String> cells = new ArrayList<>();
	    cells.add("TODO"); //TODO coderName über parent?
	    cells.add(fmeasure);
	    cells.add(recall);
	    cells.add(precision);
	    TabularValidationReportRow newRow = new TabularValidationReportRow(cells);
	    //TODO Key? kann ich den überhaupt manuell setzen? Das ist doch immer die Sache des DataStores.
	    //persist newRow via Peristence manager
	    getPersistenceManager().makePersistent(newRow);
	}
    }
*/
    private TabularValidationReportRow createStandardFMeasureHeader() {
	List<String> cells = new ArrayList<>();
	cells.add("Coder");
	cells.add("FMeasure");
	cells.add("Recall");
	cells.add("Precision");
	return new TabularValidationReportRow(cells);
    }

    /**
     * Access Entites from the DataStore through low level API. As we do a data
     * migration we can not use the classes from the Java Code as their
     * definitions changed!
     *
     * @param entityName the String name of the entity in the DataStore
     * @return all Entities from the DataStore as Iterable
     */
    private Iterable<Entity> getAll(String entityName, DatastoreService datastore) {
	com.google.appengine.api.datastore.Query q = new com.google.appengine.api.datastore.Query(entityName);
	PreparedQuery pq = datastore.prepare(q);

	return pq.asIterable();
    }
    
    private String cleanForCsv(String dirty) {
	return dirty.replace(",", "&#44;");
    }

}
