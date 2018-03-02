package com.qdacity.project.metrics.tasks.algorithms;

import java.util.List;

import javax.jdo.PersistenceManager;

import com.google.api.server.spi.auth.common.User;
import com.google.appengine.api.taskqueue.DeferredTask;
import com.qdacity.PMF;
import com.qdacity.endpoint.TextDocumentEndpoint;
import com.qdacity.project.ValidationProject;
import com.qdacity.project.data.TextDocument;
import com.qdacity.project.metrics.EvaluationUnit;
import com.qdacity.project.metrics.ValidationResult;

/**
 * Template class for DeferredTasks running an EvaluationAlgorithm which
 * produces a ValidationResult
 */
public abstract class DeferredAlgorithmEvaluation implements DeferredTask {

    protected static final long serialVersionUID = 2611140265864647884L;
    protected PersistenceManager mgr;
    protected final ValidationProject validationProject;
    protected final User user;
    protected final Long validationReportId;
    protected final EvaluationUnit evalUnit;
    protected final List<Long> textDocumentIds;
    protected List<TextDocument> textDocuments;

    protected ValidationResult valResult;

    public DeferredAlgorithmEvaluation(ValidationProject validationProject, User user, Long validationReportId, EvaluationUnit evalUnit, List<Long> textDocumentIds) {
	this.validationProject = validationProject;
	this.validationReportId = validationReportId;
	this.user = user;
	this.evalUnit = evalUnit;
	this.textDocumentIds = textDocumentIds;
    }

    @Override
    public void run() {
	try {
	    mgr = getPersistenceManager();
	    mgr.setMultithreaded(true);
	    textDocuments = TextDocumentEndpoint.collectTextDocumentsfromMemcache(textDocumentIds);
	    valResult = makeNextValidationResult();
	    runAlgorithm();
	    if (valResult.getReportRow() != null
		    && valResult.getReportRow() != "") {
		mgr.makePersistent(valResult);
	    }
	} catch (Exception e) {
	    e.printStackTrace();
	} finally {
	    mgr.close();
	}
    }

    /**
     * Creates and initially persists a validationResult, where only the
     * reportRow is missing. Set the reportRow in this validationResult and make
     * sure to persist it again.
     *
     * @return the newly created and initially persisted ValidationResult
     */
    protected ValidationResult makeNextValidationResult() {
	ValidationResult newResult = new ValidationResult();
	newResult.setRevisionID(validationProject.getRevisionID());
	newResult.setValidationProjectID(validationProject.getId());
	newResult.setReportID(validationReportId);
	newResult.setReportRow(null); //intentionally initialize with null!
	mgr.makePersistent(newResult);// make persistent to generate ID which is passed to deferred persistence of DocumentResults
	return newResult;
    }

    protected abstract void runAlgorithm() throws Exception;

    protected static PersistenceManager getPersistenceManager() {
	return PMF.get().getPersistenceManager();
    }
}
