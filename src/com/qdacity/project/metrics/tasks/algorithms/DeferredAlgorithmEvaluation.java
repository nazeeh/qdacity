package com.qdacity.project.metrics.tasks.algorithms;

import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.memcache.MemcacheService;
import com.google.appengine.api.memcache.MemcacheServiceFactory;
import com.google.appengine.api.taskqueue.DeferredTask;
import com.google.appengine.api.users.User;
import com.qdacity.PMF;
import com.qdacity.project.ValidationProject;
import com.qdacity.project.data.TextDocument;
import com.qdacity.project.metrics.ValidationResult;
import java.util.ArrayList;
import java.util.List;
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
    protected final Long validationReportId;

    protected ValidationResult valResult;

    public DeferredAlgorithmEvaluation(ValidationProject validationProject, User user, Long validationReportId) {
	this.validationProject = validationProject;
	this.validationReportId = validationReportId;
	this.user = user;
    }

    @Override
    public void run() {
	try {
	    mgr = getPersistenceManager();
	    mgr.setMultithreaded(true);
	    valResult = makeNextValidationResult();
	    runAlgorithm();
	    mgr.makePersistent(valResult);
	} catch (Exception e) {
	    e.printStackTrace();
	} finally {
	    mgr.close();
	}
    }

    /**
     * Creates and initially persists a validationResult, where only the reportRow is missing.
     * Set the reportRow in this validationResult and make sure to persist it again.
     * @return the newly created and initially persisted ValidationResult
     */
    protected ValidationResult makeNextValidationResult() {
	ValidationResult validationResult = new ValidationResult();
	valResult.setRevisionID(validationProject.getRevisionID());
	valResult.setValidationProjectID(validationProject.getId());
	valResult.setReportID(validationReportId);
	mgr.makePersistent(validationResult);// make persistent to generate ID which is passed to deferred persistence of DocumentResults
	return validationResult;
    }

    protected List<TextDocument> collectTextDocumentsfromMemcache(List<Long> textDocumentIds) {
	List<TextDocument> textDocuments = new ArrayList<>();
	for (Long docID : textDocumentIds) { //Get Textdocuments from Memcache
	    String keyString = KeyFactory.createKeyString(TextDocument.class.toString(), docID);
	    MemcacheService syncCache = MemcacheServiceFactory.getMemcacheService();
	    syncCache.get(keyString);
	    TextDocument origialDoc = (TextDocument) syncCache.get(keyString);
	    if (origialDoc == null) {
		origialDoc = mgr.getObjectById(TextDocument.class, docID);
	    }
	    textDocuments.add(origialDoc);
	}
	return textDocuments;
    }

    protected abstract void runAlgorithm() throws Exception;

    protected static PersistenceManager getPersistenceManager() {
	return PMF.get().getPersistenceManager();
    }
}
