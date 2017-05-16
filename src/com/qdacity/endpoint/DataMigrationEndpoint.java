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
	//assumption: Data only contains ValidationReports that have run an FMeasure!
	migrateValidationReports(user);
	migrateDocumentResults(user);
	migrateValidationResults(user);
	//Needs to be done last, as others used ParagraphAgreement
	migrateParagraphAgreements(user);
    }

    private static PersistenceManager getPersistenceManager() {
	return PMF.get().getPersistenceManager();
    }

    private void migrateValidationReports(User user) {
	TabularValidationReportRow standardFMeasureHeader = createStandardFMeasureHeader();
	//Column: paragraphAgreement -> avgAgreement (String) value: "Average, <fmeasure>, <recall>, <precision>"
	//New column: avgAgreementHead (String) value: "Coder,FMeasure,Recall,Precision"
	//New column: detailedAgreementHead (String) value: "Coder,FMeasure,Recall,Precision"
	//New column: evaluationUnit (String) value: "paragraph"
	for (Entity result : getAll("ValidationReport")) {
	    //TODO
	}
    }

    private void migrateDocumentResults(User user) {
	//Column: paragraphAgreement -> reportRow (String) value: "<documentName>, <fmeasure>, <recall>, <precision>"
	for (Entity result : getAll("DocumentResult")) {
	    //TODO
	}
    }

    private void migrateValidationResults(User user) {
	//Column: paragraphAgreement -> reportRow (String) value: "<coderName>, <fmeasure>, <recall>, <precision>"
	for (Entity result : getAll("ValidationResult")) {
	    //TODO
	}
    }

    private void migrateParagraphAgreements(User user) {
	//TODO all ParagraphAgreement -> TabularValidationReportRow
	//HINT: as the class ParagraphAgreement has been renamed to FMeasureResult we need to access it manually in the DataStore.
	for (Entity result : getAll("ParagraphAgreement")) {
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
	    //TODO Key?
	    //TODO persist newRow
	}
    }

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
    private Iterable<Entity> getAll(String entityName) {
	DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
	com.google.appengine.api.datastore.Query q = new com.google.appengine.api.datastore.Query(entityName);
	PreparedQuery pq = datastore.prepare(q);

	return pq.asIterable();
    }

}
