package com.qdacity.maintenance.tasks.v4tov5migration;

import java.util.ArrayList;
import java.util.List;

import javax.jdo.PersistenceManager;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query.Filter;
import com.qdacity.PMF;
import com.qdacity.project.metrics.TabularValidationReportRow;

/**
 * This class has package visibility intentionally!
 */
class V4toV5AgreementHelperMethods {

    protected static PersistenceManager getPersistenceManager() {
	return PMF.get().getPersistenceManager();
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

	/**
	 * Access Entites from the DataStore through low level API. As we do a data
	 * migration we can not use the classes from the Java Code as their
	 * definitions changed!
	 *
	 * @param entityName the String name of the entity in the DataStore
	 * @param filter the filter to apply to the query for entityName
	 * @return all Entities from the DataStore as Iterable
	 */
	protected static Iterable<Entity> getWithFilter(String entityName, Filter filter, DatastoreService datastore) {
		com.google.appengine.api.datastore.Query q = new com.google.appengine.api.datastore.Query(entityName).setFilter(filter);
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
