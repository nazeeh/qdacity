package com.qdacity.project.metrics.tasks.algorithms;

import com.google.appengine.api.taskqueue.DeferredTask;
import com.google.appengine.api.users.User;
import com.qdacity.PMF;
import com.qdacity.project.ValidationProject;
import com.qdacity.project.metrics.ValidationResult;
import javax.jdo.PersistenceManager;

/**
 * Template class for DeferredTasks running an EvaluationAlgorithm which
 * produces a ValidationResult
 */
public abstract class DeferredAlgorithmEvaluation implements DeferredTask {

    protected static final long serialVersionUID = 2611140265864647884L;
    protected PersistenceManager mgr;
    protected ValidationResult valResult;
    protected final ValidationProject validationProject;
    protected final User user;
    protected final Long validationReportId;

    public DeferredAlgorithmEvaluation(ValidationProject validationProject, User user, Long validationReportId) {
	this.validationProject = validationProject;
	this.user = user;
	this.validationReportId = validationReportId;
    }

    @Override
    public void run() {
	try {
	    mgr = getPersistenceManager();
	    valResult = new ValidationResult();
	    mgr.makePersistent(valResult); // make persistent to generate ID which is passed to deferred persistence of DocumentResults
	    runAlgorithm();
	    valResult.setName(validationProject.getCreatorName());
	    valResult.setRevisionID(validationProject.getRevisionID());
	    valResult.setValidationProjectID(validationProject.getId());
	    valResult.setReportID(validationReportId);
	    mgr.setMultithreaded(true); // FIXME needed?
	    mgr.makePersistent(valResult);
	} catch (Exception e) {
	    // TODO Auto-generated catch block
	    e.printStackTrace();
	} finally {
	    mgr.close();
	}
    }

    protected abstract void runAlgorithm() throws Exception;

    protected static PersistenceManager getPersistenceManager() {
	return PMF.get().getPersistenceManager();
    }
}
