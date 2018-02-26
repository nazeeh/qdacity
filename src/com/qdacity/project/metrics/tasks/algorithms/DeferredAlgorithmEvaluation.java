package com.qdacity.project.metrics.tasks.algorithms;

import java.util.List;

import javax.jdo.PersistenceManager;

import com.google.appengine.api.taskqueue.DeferredTask;
import com.google.api.server.spi.auth.common.User;
import com.qdacity.PMF;
import com.qdacity.endpoint.TextDocumentEndpoint;
import com.qdacity.exercise.ExerciseProject;
import com.qdacity.project.Project;
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
    protected ValidationProject validationProject = null;
    protected ExerciseProject exerciseProject = null;
    protected final User user;
    protected Long validationReportId;
    protected Long exerciseReportId;
    protected final EvaluationUnit evalUnit;
    protected final List<Long> textDocumentIds;
    protected List<TextDocument> textDocuments;
    protected ProjectType projectType;
    protected Result result;

    public DeferredAlgorithmEvaluation(ValidationProject validationProject, User user, Long validationReportId, EvaluationUnit evalUnit, List<Long> textDocumentIds, ProjectType projectType) {
	this.validationProject = validationProject;
	this.validationReportId = validationReportId;
	this.user = user;
	this.evalUnit = evalUnit;
	this.textDocumentIds = textDocumentIds;
	this.projectType = projectType;
    }

    public DeferredAlgorithmEvaluation(ExerciseProject exerciseProject, User user, Long exerciseReportId, EvaluationUnit evalUnit, List<Long> textDocumentIds, ProjectType projectType) {
        this.exerciseProject = exerciseProject;
        this.exerciseReportId = exerciseReportId;
        this.user = user;
        this.evalUnit = evalUnit;
        this.textDocumentIds = textDocumentIds;
        this.projectType = projectType;
    }

    @Override
    public void run() {
	try {
	    mgr = getPersistenceManager();
	    mgr.setMultithreaded(true);
	    textDocuments = TextDocumentEndpoint.collectTextDocumentsfromMemcache(textDocumentIds);
	    if (projectType == ProjectType.VALIDATION) result = makeNextValidationResult();
	    else if (projectType == ProjectType.EXERCISE) result = makeNextExerciseResult();
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
	newResult.setRevisionID(validationProject.getRevisionID());
	newResult.setValidationProjectID(validationProject.getId());
	newResult.setReportID(validationReportId);
	newResult.setReportRow(null); //intentionally initialize with null!
	mgr.makePersistent(newResult);// make persistent to generate ID which is passed to deferred persistence of DocumentResults
	return newResult;
    }

    /**
     * Creates and initially persists a validationResult, where only the
     * reportRow is missing. Set the reportRow in this validationResult and make
     * sure to persist it again.
     *
     * @return the newly created and initially persisted Result
     */
    protected Result makeNextExerciseResult() {
        ExerciseResult newResult = new ExerciseResult();
        newResult.setRevisionID(exerciseProject.getRevisionID());
        newResult.setValidationProjectID(exerciseProject.getId());
        newResult.setReportID(exerciseReportId);
        newResult.setReportRow(null); //intentionally initialize with null!
        mgr.makePersistent(newResult);// make persistent to generate ID which is passed to deferred persistence of DocumentResults
        return newResult;
    }

    protected abstract void runAlgorithm() throws Exception;

    protected static PersistenceManager getPersistenceManager() {
	return PMF.get().getPersistenceManager();
    }
}
