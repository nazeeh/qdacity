package com.qdacity.project.metrics.tasks;

import com.google.appengine.api.taskqueue.Queue;
import com.google.appengine.api.taskqueue.QueueFactory;
import com.qdacity.maintenance.tasks.DocResultDeletion;
import com.qdacity.project.metrics.ValidationResult;

import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import java.util.List;


public class DeferredValidationReportDeletion extends DeferredReportDeletion {
    Long reportID;
    public List<ValidationResult> validationResults;
    public DeferredValidationReportDeletion(Long reportID) {
        this.reportID = reportID;
    }


    @Override
    public void run() {
        PersistenceManager mgr = getPersistenceManager();

        try {
            Query q2 = mgr.newQuery(ValidationResult.class, "reportID  == :reportID");
            this.validationResults = (List<ValidationResult>) q2.execute(this.reportID);
            mgr.deletePersistentAll(validationResults);
        }
        finally {
            mgr.close();
        }

        super.deleteDocumentResults(validationResults);



    }
}