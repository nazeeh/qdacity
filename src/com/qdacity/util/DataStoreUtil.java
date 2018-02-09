package com.qdacity.util;

import com.google.appengine.api.datastore.*;

public class DataStoreUtil {
	public static int countEntities(String entityName){
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		Query q = new Query(entityName).setKeysOnly();
		PreparedQuery pq = datastore.prepare(q);
		return pq.countEntities(FetchOptions.Builder.withDefaults());
	}
	
	public static int countEntitiesWithFilter(String entityName, Query.Filter filter) {
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		Query q = new Query(entityName).setKeysOnly();
		q.setFilter(filter);
		PreparedQuery pq = datastore.prepare(q);
		return pq.countEntities(FetchOptions.Builder.withDefaults());
	}

	public static int countDistinctEntitiesWithFilter(String entityName, Query.Filter filter, Projection projection) {
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		Query q = new Query(entityName);
		q.setFilter(filter);
		q.setDistinct(true);
		q.addProjection(projection);
		PreparedQuery pq = datastore.prepare(q);
		return pq.countEntities(FetchOptions.Builder.withDefaults());
	}
}
