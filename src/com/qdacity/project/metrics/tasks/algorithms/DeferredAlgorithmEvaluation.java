package com.qdacity.project.metrics.tasks.algorithms;

import com.google.appengine.api.taskqueue.DeferredTask;
import com.google.appengine.api.users.User;
import com.qdacity.PMF;
import com.qdacity.project.ValidationProject;
import javax.jdo.PersistenceManager;

/**
 * Template class for DeferredTasks running an EvaluationAlgorithm which
 * produces a ValidationResult
 */
public abstract class DeferredAlgorithmEvaluation implements DeferredTask {

    protected static final long serialVersionUID = 2611140265864647884L;
    protected PersistenceManager mgr;
    protected final ValidationProject validationProject;
    protected final User user;

    public DeferredAlgorithmEvaluation(ValidationProject validationProject, User user) {
	this.validationProject = validationProject;
	this.user = user;
    }

    @Override
    public void run() {
	try {
	    mgr = getPersistenceManager();
	    mgr.setMultithreaded(true);
	    runAlgorithm();
	} catch (Exception e) {
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
