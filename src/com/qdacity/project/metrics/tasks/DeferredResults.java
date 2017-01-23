package com.qdacity.project.metrics.tasks;

import javax.jdo.PersistenceManager;
import javax.jdo.Transaction;

import com.google.appengine.api.taskqueue.DeferredTask;
import com.qdacity.PMF;
import com.qdacity.project.metrics.ValidationResult;

public class DeferredResults implements DeferredTask {

	/**
	 * 
	 */
	private static final long serialVersionUID = -9038103832612303695L;
	ValidationResult result;

	public DeferredResults(ValidationResult result) {
		super();
		this.result = result;
	}

	@Override
	public void run() {
		PersistenceManager mgr = getPersistenceManager();
		Transaction tx = mgr.currentTransaction();
		try {

			tx.begin();

			mgr.makePersistent(result);
			tx.commit();

		} finally {
			if (tx.isActive()) {
				tx.rollback(); // Error occurred so rollback the PM transaction
			}
			mgr.close();
		}

	}

	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}
}
