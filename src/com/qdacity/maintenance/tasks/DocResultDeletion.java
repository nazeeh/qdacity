package com.qdacity.maintenance.tasks;

import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.jdo.PersistenceManager;
import javax.jdo.Query;

import com.google.appengine.api.taskqueue.DeferredTask;
import com.qdacity.PMF;
import com.qdacity.project.metrics.DocumentResult;

public class DocResultDeletion implements DeferredTask {

	/**
	 * 
	 */
	private static final long serialVersionUID = 7998399854742800165L;
	Long resultID;

	public DocResultDeletion(Long resultID) {
		super();
		this.resultID = resultID;
	}

	@Override
	public void run() {
		PersistenceManager mgr = getPersistenceManager();
		try {
			Query docResultQuery = mgr.newQuery(DocumentResult.class);
			docResultQuery.setFilter("validationResultID == " + resultID);
			@SuppressWarnings("unchecked")
			List<DocumentResult> docResults = (List<DocumentResult>) docResultQuery.execute();
			Logger.getLogger("logger").log(Level.INFO, "Deleting " + docResults.size() + " DocumentResult.");
			mgr.deletePersistentAll(docResults);

		} finally {
			mgr.close();
		}

	}

	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}

}
