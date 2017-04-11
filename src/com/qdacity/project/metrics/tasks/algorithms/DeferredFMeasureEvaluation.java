package com.qdacity.project.metrics.tasks.algorithms;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.memcache.Expiration;
import com.google.appengine.api.memcache.MemcacheService;
import com.google.appengine.api.memcache.MemcacheServiceFactory;
import com.google.appengine.api.taskqueue.Queue;
import com.google.appengine.api.taskqueue.QueueFactory;
import com.google.appengine.api.users.User;
import com.qdacity.endpoint.TextDocumentEndpoint;
import com.qdacity.project.ValidationProject;
import com.qdacity.project.data.TextDocument;
import com.qdacity.project.metrics.algorithms.FMeasure;
import com.qdacity.project.metrics.DocumentResult;
import com.qdacity.project.metrics.ParagraphAgreement;
import com.qdacity.project.metrics.tasks.DeferredDocResults;

public class DeferredFMeasureEvaluation extends DeferredAlgorithmEvaluation {

    private static final long serialVersionUID = 2611140265864647884L;
    List<Long> docIDs;
    List<Long> orignalDocIDs;

    public DeferredFMeasureEvaluation(ValidationProject validationPrj, List<Long> docIDs, List<Long> orignalDocIDs, Long validationReportID, User user) {
	super(validationPrj, user, validationReportID);
	this.docIDs = docIDs; // FIXME dont need anymore, because only list of relevant textdocumentIDs is passed?
	this.orignalDocIDs = orignalDocIDs;
    }

    @Override
    protected void runAlgorithm() throws Exception {

	TextDocumentEndpoint tde = new TextDocumentEndpoint();

	Collection<TextDocument> originalDocs = new ArrayList<>();

	for (Long docID : orignalDocIDs) {
	    String keyString = KeyFactory.createKeyString(TextDocument.class.toString(), docID);
	    MemcacheService syncCache = MemcacheServiceFactory.getMemcacheService();
	    syncCache.get(keyString);
	    TextDocument origialDoc = (TextDocument) syncCache.get(keyString);
	    if (origialDoc == null) {
		origialDoc = mgr.getObjectById(TextDocument.class, docID);
	    }
	    originalDocs.add(origialDoc);
	}

	List<ParagraphAgreement> documentAgreements = new ArrayList<>();

	Collection<TextDocument> recodedDocs = tde.getTextDocument(validationProject.getId(), "VALIDATION", user).getItems();

	for (TextDocument textDocument : recodedDocs) {
	    String keyString = KeyFactory.createKeyString(TextDocument.class.toString(), textDocument.getId());
	    MemcacheService syncCache = MemcacheServiceFactory.getMemcacheService();
	    syncCache.put(keyString, textDocument, Expiration.byDeltaSeconds(300));

	}

	for (TextDocument original : originalDocs) {// FIXME reverse order of the two loops to put the memcache operation here instead of preceding in its own loop
	    // if (!docIDs.contains(original.getId())) continue; // Exclude text documents that should not be considered

	    for (TextDocument recoded : recodedDocs) {
		if (original.getTitle().equals(recoded.getTitle())) {
		    DocumentResult documentAgreement = FMeasure.calculateParagraphAgreement(original, recoded);
		    documentAgreements.add(documentAgreement.getParagraphAgreement());

		    // valResult.addDocumentResult(documentAgreement);
		    documentAgreement.setValidationResultID(valResult.getId());
		    documentAgreement.setOriginDocumentID(original.getId());

		    // Persist all DocumentResults asynchronously
		    DeferredDocResults deferredDocResults = new DeferredDocResults(documentAgreement, recoded.getId(), user);
		    Queue queue = QueueFactory.getQueue("DocumentResultQueue");

		    queue.addAsync(com.google.appengine.api.taskqueue.TaskOptions.Builder.withPayload(deferredDocResults));

		}
	    }
	}

	ParagraphAgreement totalAgreement = FMeasure.calculateAverageAgreement(documentAgreements);
	valResult.setParagraphAgreement(totalAgreement);

    }

}
