package com.qdacity.project.metrics.tasks;

import java.util.List;

import javax.jdo.PersistenceManager;
import javax.jdo.Query;

import com.google.appengine.api.taskqueue.DeferredTask;
import com.google.appengine.api.taskqueue.Queue;
import com.google.appengine.api.taskqueue.QueueFactory;
import com.qdacity.PMF;
import com.qdacity.maintenance.tasks.DocResultDeletion;
import com.qdacity.project.metrics.ValidationResult;

public class DeferredReportDeletion implements DeferredTask {

	/**
	 * 
	 */
	private static final long serialVersionUID = -8570568068021070517L;
	Long reportID;

	public DeferredReportDeletion(Long reportID) {
		super();
		this.reportID = reportID;
	}

	@Override
	public void run() {
		PersistenceManager mgr = getPersistenceManager();
		try {

			Query q2 = mgr.newQuery(ValidationResult.class, "reportID  == :reportID");
			@SuppressWarnings("unchecked")
			List<ValidationResult> results = (List<ValidationResult>) q2.execute(this.reportID);

			for (ValidationResult validationResult : results) {
				validationResult.getId(); //Lazy fetch
			}

			// Delete all DocumentResults corresponding to the ValidationResults
			for (ValidationResult validationResult : results) {
				DocResultDeletion task = new DocResultDeletion(validationResult.getId());
				Queue queue = QueueFactory.getDefaultQueue();
				queue.addAsync(com.google.appengine.api.taskqueue.TaskOptions.Builder.withPayload(task));
			}

			mgr.deletePersistentAll(results);

		} finally {

			mgr.close();
		}

	}

	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}
}
