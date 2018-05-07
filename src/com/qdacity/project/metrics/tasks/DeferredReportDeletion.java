package com.qdacity.project.metrics.tasks;
import javax.jdo.PersistenceManager;
import com.google.appengine.api.taskqueue.DeferredTask;
import com.google.appengine.api.taskqueue.Queue;
import com.google.appengine.api.taskqueue.QueueFactory;
import com.qdacity.PMF;
import com.qdacity.maintenance.tasks.DocResultDeletion;
import com.qdacity.project.metrics.ExerciseResult;
import com.qdacity.project.metrics.Result;

import java.util.List;

public abstract class DeferredReportDeletion implements DeferredTask {

	/**
	 * 
	 */
	private static final long serialVersionUID = -8570568068021070517L;


	@Override
    public void run() {

    }
	protected PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}


	public void deleteDocumentResults(List<? extends Result> results) {
        // Delete all DocumentResults corresponding to the Exercise/Validation Results
        for (Result result : results) {
            DocResultDeletion task = new DocResultDeletion(result.getId());
            Queue queue = QueueFactory.getDefaultQueue();
            queue.addAsync(com.google.appengine.api.taskqueue.TaskOptions.Builder.withPayload(task));
        }
    }

}
