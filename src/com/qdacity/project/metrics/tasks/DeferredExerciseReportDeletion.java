package com.qdacity.project.metrics.tasks;

import com.google.appengine.api.taskqueue.Queue;
import com.google.appengine.api.taskqueue.QueueFactory;
import com.qdacity.maintenance.tasks.DocResultDeletion;
import com.qdacity.project.metrics.ExerciseResult;

import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import java.util.List;


public class DeferredExerciseReportDeletion extends DeferredReportDeletion {
    Long reportID;
    public List<ExerciseResult> exerciseResults;
	public DeferredExerciseReportDeletion(Long reportID) {
		this.reportID = reportID;
	}


	@Override
	public void run() {
        PersistenceManager mgr = getPersistenceManager();

        try {
            Query q2 = mgr.newQuery(ExerciseResult.class, "reportID  == :reportID");
            this.exerciseResults = (List<ExerciseResult>) q2.execute(this.reportID);
            mgr.deletePersistentAll(exerciseResults);
        }
        finally {
            mgr.close();
        }

        super.deleteDocumentResults(exerciseResults);

	}
}
