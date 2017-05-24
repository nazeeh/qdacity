package com.qdacity.maintenance.tasks.v4tov5migration;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.qdacity.PMF;
import com.qdacity.project.metrics.TabularValidationReportRow;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.jdo.PersistenceManager;

/**
 * This class has package visibility intentionally!
 */
class V4toV5AgreementHelperMethods {

    protected static PersistenceManager getPersistenceManager() {
	return PMF.get().getPersistenceManager();
    }

    protected static Iterable<Entity> listChildren(String kind, Key ancestor, DatastoreService datastore) {
	//from: http://stackoverflow.com/questions/12985028/java-appengnie-code-to-get-child-entity-from-datastore-not-working
	Logger.getLogger("logger").log(Level.INFO, "Search entities based on parent");
	Query query = new Query(kind);
	query.setAncestor(ancestor);
	PreparedQuery pq = datastore.prepare(query);
	return pq.asIterable();
    }

    protected static Entity getChildEntity(Entity e, String name, DatastoreService datastore) throws EntityNotFoundException {
	//HINT: Problem: Class ParagraphAgreement does not exist any more. We need to deal with it manually.
	Key key = (Key) e.getProperty(name);
	if (key != null) {
	    return (Entity) datastore.get(key);
	}
	return null;

    }

    protected static TabularValidationReportRow createStandardFMeasureHeader() {
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
    protected static Iterable<Entity> getAll(String entityName, DatastoreService datastore) {
	com.google.appengine.api.datastore.Query q = new com.google.appengine.api.datastore.Query(entityName);
	PreparedQuery pq = datastore.prepare(q);

	return pq.asIterable();
    }

    protected static String cleanForCsv(Double dirty) {
	if (dirty != null) {
	    return String.valueOf(dirty).replace(",", "&#44;");
	}
	return "";
    }
}
