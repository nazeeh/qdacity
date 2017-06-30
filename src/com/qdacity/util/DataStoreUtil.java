package com.qdacity.util;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;

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
}
