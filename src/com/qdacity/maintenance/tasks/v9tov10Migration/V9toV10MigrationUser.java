package com.qdacity.maintenance.tasks.v9tov10Migration;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.taskqueue.DeferredTask;
import com.qdacity.project.metrics.EvaluationMethod;
import java.util.logging.Level;
import java.util.logging.Logger;

public class V9toV10MigrationUser implements DeferredTask {

	@Override
	public void run() {
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		Iterable<Entity> users = getAll("User", datastore);
		for (Entity user : users) {
			try {
				// If the user does not already have the new attribute we need to add it
				if (!user.hasProperty("loginProviderInformations")){
					//set new attribut
					user.setProperty("loginProviderInformations", null);
					//Persist changes
					datastore.put(user);
				}

			} catch (Exception e) {
				//catch Exception, log it, then continue
				Logger.getLogger("logger").log(Level.SEVERE, e.getMessage());
			}
		}
	}

	private static Iterable<Entity> getAll(String entityName, DatastoreService datastore) {
		com.google.appengine.api.datastore.Query q = new com.google.appengine.api.datastore.Query(entityName);
		PreparedQuery pq = datastore.prepare(q);

		return pq.asIterable();
	}

}
