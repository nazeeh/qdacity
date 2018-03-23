package com.qdacity.project.metrics.tasks.algorithms;

import java.util.List;

import javax.jdo.PersistenceManager;

import com.google.api.server.spi.auth.common.User;
import com.google.appengine.api.taskqueue.DeferredTask;
import com.qdacity.PMF;
import com.qdacity.endpoint.TextDocumentEndpoint;
import com.qdacity.exercise.ExerciseProject;
import com.qdacity.project.Project;
import com.qdacity.project.ProjectRevision;
import com.qdacity.project.ProjectType;
import com.qdacity.project.ValidationProject;
import com.qdacity.project.data.TextDocument;
import com.qdacity.project.metrics.EvaluationUnit;
import com.qdacity.project.metrics.ExerciseResult;
import com.qdacity.project.metrics.Result;
import com.qdacity.project.metrics.ValidationResult;

/**
 * Template class for DeferredTasks running an EvaluationAlgorithm which
 * produces a Result
 */
public abstract class DeferredAlgorithmEvaluation implements DeferredTask {

    protected static final long serialVersionUID = 2611140265864647884L;
    protected PersistenceManager mgr;
    protected ProjectRevision project;
    protected final User user;
    protected Long reportId;
    protected final EvaluationUnit evalUnit;
    protected final List<Long> textDocumentIds;
    protected List<TextDocument> textDocuments;
    protected Result result;

    public DeferredAlgorithmEvaluation(ProjectRevision project, User user, Long reportId, EvaluationUnit evalUnit, List<Long> textDocumentIds) {
	this.project = project;
	this.reportId = reportId;
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
	    if (project instanceof ValidationProject) result = makeNextValidationResult();
	    else if (project instanceof ExerciseProject) result = makeNextExerciseResult();

	    runAlgorithm();
	    if (result.getReportRow() != null
		    && result.getReportRow() != "") {
		mgr.makePersistent(result);
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
     * @return the newly created and initially persisted Result
     */
    protected Result makeNextValidationResult() {
	    ValidationResult newResult = new ValidationResult();
	    newResult.setRevisionID(project.getRevisionID());
	    newResult.setProjectID(project.getId());
	    newResult.setReportID(reportId);
	    newResult.setReportRow(null); //intentionally initialize with null!
	    mgr.makePersistent(newResult);// make persistent to generate ID which is passed to deferred persistence of DocumentResults
	    return newResult;
    }


    /**
     * Creates and initially persists a exerciseResult, where only the
     * reportRow is missing. Set the reportRow in this exerciseResult and make
     * sure to persist it again.
     *
     * @return the newly created and initially persisted Result
     */
    protected Result makeNextExerciseResult() {
        ExerciseResult newResult = new ExerciseResult();
        newResult.setRevisionID(project.getRevisionID());
        newResult.setProjectID(project.getId());
        newResult.setReportID(reportId);
        newResult.setReportRow(null); //intentionally initialize with null!
        mgr.makePersistent(newResult);// make persistent to generate ID which is passed to deferred persistence of DocumentResults
        return newResult;
    }

    protected abstract void runAlgorithm() throws Exception;

    protected static PersistenceManager getPersistenceManager() {
	return PMF.get().getPersistenceManager();
    }
}
