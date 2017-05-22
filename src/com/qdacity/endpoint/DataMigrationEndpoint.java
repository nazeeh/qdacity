package com.qdacity.endpoint;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.api.users.User;
import com.qdacity.Constants;
import com.qdacity.PMF;
import com.qdacity.project.metrics.TabularValidationReportRow;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

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
     * @throws EntityNotFoundException 
     */
    @ApiMethod(
	    name = "migration.migrateV4toV5",
	    scopes = {Constants.EMAIL_SCOPE},
	    clientIds = {Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
	    audiences = {Constants.WEB_CLIENT_ID})
    public void migrateV4toV5(User user) throws EntityNotFoundException {
	//TODO Run everything in taskQUeues!!
	//assumption: Data only contains ValidationReports that have run an FMeasure!
	DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
	migrateValidationReports(user, datastore); //TODO replace with V4toV5MigrationValidationReports Task
	migrateDocumentResults(user, datastore); //TODO replace with V4toV5MigrationDocumentResults Task
	migrateValidationResults(user, datastore); //TODO replace with V4toV5MigrationValidationResults Task
	//Needs to be done last, as others used ParagraphAgreement
	//TODO replace with V4toV5MigrationParagraphAgreements Task
	//migrateParagraphAgreements(user, datastore); //Gibt es �berhaupt "freie" ParagraphAgreements? Oder sind schon alle abgefertigt mit den ersten drei Schritten?
    }

    private static PersistenceManager getPersistenceManager() {
	return PMF.get().getPersistenceManager();
    }

    private void migrateValidationReports(User user, DatastoreService datastore) throws EntityNotFoundException {
	TabularValidationReportRow standardFMeasureHeader = createStandardFMeasureHeader();
	//Column: paragraphAgreement -> avgAgreement (String) value: "Average, <fmeasure>, <recall>, <precision>"
	//New column: avgAgreementHead (String) value: "Coder,FMeasure,Recall,Precision"
	//New column: detailedAgreementHead (String) value: "Coder,FMeasure,Recall,Precision"
	//New column: evaluationUnit (String) value: "paragraph"
	Iterable<Entity> reports = getAll("ValidationReport", datastore);
	for (Entity report : reports) {
		if(report != null)
	    Logger.getLogger("logger").log(Level.INFO, "Report "+report.getProperty("name")+ " report: "+report);
	    //HINT: Problem: Class ParagraphAgreement does not exist any more. We need to deal with it manually.
	    Entity avgParagraphAgreementEntity = getChildEntity(report, "paragraphAgreement", datastore);
	    Logger.getLogger("logger").log(Level.INFO, "Reports avgParagraphAgreement: "+avgParagraphAgreementEntity);
	    Logger.getLogger("logger").log(Level.INFO, "Updating ParagraphAgreement: "+avgParagraphAgreementEntity.getKey());

	    
	    String fmeasure = cleanForCsv((Double) avgParagraphAgreementEntity.getProperty("fMeasure"));
	    String recall = cleanForCsv((Double) avgParagraphAgreementEntity.getProperty("recall"));
	    String precision = cleanForCsv((Double) avgParagraphAgreementEntity.getProperty("precision"));

	    Logger.getLogger("logger").log(Level.INFO, "reportRow.setProperty('reportRow', 'Average," + fmeasure + "," + recall + "," + precision+"')");
	    report.setProperty("avgAgreement", "Average," + fmeasure + "," + recall + "," + precision);
	    report.setProperty("evaluationUnit", "paragraph");
	    report.setProperty("avgAgreementHead", standardFMeasureHeader.toString());
	    report.setProperty("detailedAgreementHead", standardFMeasureHeader.toString());
	    Logger.getLogger("logger").log(Level.INFO, "report.removeProperty(\"paragraphAgreement\");");
	    report.removeProperty("paragraphAgreement"); //muss man das tun?
	    //TODO das ParagraphAgreement selbst muss man hier noch l�schen!
	    datastore.delete(avgParagraphAgreementEntity.getKey());
	    //Persist changes
	    datastore.put(report);
	}
    }
    
    private Entity getChildEntity(Entity e, String name, DatastoreService datastore) throws EntityNotFoundException {
        //HINT: Problem: Class ParagraphAgreement does not exist any more. We need to deal with it manually.
    	
    	Key key = (Key) e.getProperty(name);
    	if(key != null) {
    		String keyString = key.toString();
    		keyString = keyString.substring(keyString.lastIndexOf("/")+1);
    		Logger.getLogger("logger").log(Level.INFO, "Keystring "+keyString);
    		Long id = Long.parseLong(keyString.substring(keyString.indexOf("(")+1, keyString.indexOf(")")));    		
    		Iterable<Entity> pas = listChildren("ParagraphAgreement", e.getKey(), datastore);
    		for(Entity pa : pas) {
    			//Logger.getLogger("logger").log(Level.INFO, "PA looks like "+pa);
    			Logger.getLogger("logger").log(Level.INFO, "PA.getKey() looks like "+pa.getKey());
    			if(pa.getKey().toString().contains(id+"")) { //Niemals wahr??
    				Logger.getLogger("logger").log(Level.INFO, "PA with id"+id+ "found");
    				return pa;
    			}
    		}
    		return (Entity) datastore.get(key); //Das hier schlägt immer fehl weil es den Key nicht gibt (Da der Key immer aus allen (großvater, Vater, Kind) besteht!
    		
    	}

	    Logger.getLogger("logger").log(Level.INFO, "Key for Entity "+e.getKey()+" Property "+name+" is NULL");
	    return null;
    }
    
    public static Iterable<Entity> listChildren(String kind, Key ancestor,DatastoreService datastore) {
    	//from: http://stackoverflow.com/questions/12985028/java-appengnie-code-to-get-child-entity-from-datastore-not-working
    	Logger.getLogger("logger").log(Level.INFO, "Search entities based on parent");
    	  Query query = new Query(kind);
    	  query.setAncestor(ancestor);
    	  PreparedQuery pq = datastore.prepare(query);
    	  return pq.asIterable();
    	}

    private void migrateDocumentResults(User user, DatastoreService datastore) throws EntityNotFoundException {
	//Column: paragraphAgreement -> reportRow (String) value: "<documentName>, <fmeasure>, <recall>, <precision>"
	Iterable<Entity> docResults = getAll("DocumentResult", datastore);
	for (Entity result : docResults) {
	    //HINT: Problem: Class ParagraphAgreement does not exist any more. We need to deal with it manually.
	    Entity paragraphAgreementEntity = getChildEntity(result, "paragraphAgreement", datastore);
	    String fmeasure = cleanForCsv((Double) paragraphAgreementEntity.getProperty("fMeasure"));
	    String recall = cleanForCsv((Double) paragraphAgreementEntity.getProperty("recall"));
	    String precision = cleanForCsv((Double) paragraphAgreementEntity.getProperty("precision"));

	    String coderName = (String) result.getProperty("documentName");

	    result.setProperty("reportRow", coderName + "," + fmeasure + "," + recall + "," + precision);
	    result.removeProperty("name");
	    result.removeProperty("paragraphAgreement");
	    //TODO das ParagraphAgreement selbst muss man hier noch l�schen!
	    //persist changes
	    datastore.put(result);
	}
    }

    private void migrateValidationResults(User user, DatastoreService datastore) throws EntityNotFoundException {
	//Column: paragraphAgreement -> reportRow (String) value: "<coderName>, <fmeasure>, <recall>, <precision>"
	Iterable<Entity> validationResults = getAll("ValidationResult", datastore);
	for (Entity result : validationResults) {

	    //HINT: Problem: Class ParagraphAgreement does not exist any more. We need to deal with it manually.
	    Entity paragraphAgreementEntity = getChildEntity(result, "paragraphAgreement", datastore);
	    String fmeasure = cleanForCsv((Double) paragraphAgreementEntity.getProperty("fMeasure"));
	    String recall = cleanForCsv((Double) paragraphAgreementEntity.getProperty("recall"));
	    String precision = cleanForCsv((Double) paragraphAgreementEntity.getProperty("precision"));

	    String coderName = (String) result.getProperty("name");

	    result.setProperty("reportRow", coderName + "," + fmeasure + "," + recall + "," + precision);
	    result.removeProperty("name");
	    result.removeProperty("paragraphAgreement");
	    //TODO das ParagraphAgreement selbst muss man hier noch l�schen!
	  
	    //Persist changes
	    datastore.put(result);
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
    private Iterable<Entity> getAll(String entityName, DatastoreService datastore) {
	com.google.appengine.api.datastore.Query q = new com.google.appengine.api.datastore.Query(entityName);
	PreparedQuery pq = datastore.prepare(q);

	return pq.asIterable();
    }
    
    private String cleanForCsv(Double dirty) {
    	if(dirty!= null) {
    		return String.valueOf(dirty).replace(",", "&#44;");
    	}
    	return "";
    }

}
