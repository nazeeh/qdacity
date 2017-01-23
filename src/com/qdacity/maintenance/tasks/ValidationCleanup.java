package com.qdacity.maintenance.tasks;

import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.jdo.PersistenceManager;
import javax.jdo.Query;

import com.google.appengine.api.taskqueue.DeferredTask;
import com.google.appengine.api.taskqueue.Queue;
import com.google.appengine.api.taskqueue.QueueFactory;
import com.qdacity.PMF;
import com.qdacity.project.metrics.ValidationResult;

public class ValidationCleanup implements DeferredTask {

	/**
	 * 
	 */
	private static final long serialVersionUID = -7044918672542148860L;

	public ValidationCleanup() {
		super();
	}

	@Override
	public void run() {
		Logger.getLogger("logger").log(Level.INFO, "Cleaning up");

		PersistenceManager mgr = getPersistenceManager();
		try {

			Query query = mgr.newQuery(ValidationResult.class);
			query.setFilter("reportID == null");

			@SuppressWarnings("unchecked")
			List<ValidationResult> results = (List<ValidationResult>) query.execute();

			for (ValidationResult result : results) {
				result.getId();
			}

			for (ValidationResult result : results) {
				DocResultDeletion task = new DocResultDeletion(result.getId());
				Queue queue = QueueFactory.getDefaultQueue();
				queue.addAsync(com.google.appengine.api.taskqueue.TaskOptions.Builder.withPayload(task));
			}

			Logger.getLogger("logger").log(Level.INFO, "Deleting " + results.size() + " ValidationResult. ");

			mgr.deletePersistentAll(results);

		} finally {
			mgr.close();
		}

	}

	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}

}
