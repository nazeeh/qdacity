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
import com.google.api.server.spi.auth.common.User;
import com.qdacity.endpoint.TextDocumentEndpoint;
import com.qdacity.project.ProjectRevision;
import com.qdacity.project.ProjectType;
import com.qdacity.project.data.TextDocument;
import com.qdacity.project.metrics.DocumentResult;
import com.qdacity.project.metrics.EvaluationUnit;
import com.qdacity.project.metrics.FMeasureResult;
import com.qdacity.project.metrics.TabularReportRow;
import com.qdacity.project.metrics.algorithms.FMeasure;
import com.qdacity.project.metrics.algorithms.datastructures.converter.FMeasureResultConverter;
import com.qdacity.project.metrics.tasks.DeferredDocResults;

public class DeferredFMeasureEvaluation extends DeferredAlgorithmEvaluation {

    List<Long> orignalDocIDs;

    public DeferredFMeasureEvaluation(ProjectRevision project, List<Long> orignalDocIDs, Long validationReportID, User user, EvaluationUnit evalUnit) {
        super(project, user, validationReportID, evalUnit, orignalDocIDs);
    }

    @Override
    protected void runAlgorithm() throws Exception {
	TextDocumentEndpoint tde = new TextDocumentEndpoint();

	List<FMeasureResult> documentAgreements = new ArrayList<>();

	Collection<TextDocument> recodedDocs = null;
	recodedDocs = tde.getTextDocument(project.getId(), ProjectType.VALIDATION, user).getItems();

	for (TextDocument textDocument : recodedDocs) {
	    String keyString = KeyFactory.createKeyString(TextDocument.class.toString(), textDocument.getId());
	    MemcacheService syncCache = MemcacheServiceFactory.getMemcacheService();
	    syncCache.put(keyString, textDocument, Expiration.byDeltaSeconds(300));

	}

	for (TextDocument original : textDocuments) {// FIXME reverse order of the two loops to put the memcache operation here instead of preceding in its own loop
	    // if (!docIDs.contains(original.getId())) continue; // Exclude text documents that should not be considered

	    for (TextDocument recoded : recodedDocs) {
		if (original.getTitle().equals(recoded.getTitle())) {
					DocumentResult documentAgreement = FMeasure.calculateParagraphAgreement(original, recoded);
		    documentAgreements.add(FMeasureResultConverter.tabularValidationReportRowToFMeasureResult(new TabularReportRow(documentAgreement.getReportRow())));

		    // valResult.addDocumentResult(documentAgreement);
		    documentAgreement.setValidationResultID(result.getId());
		    documentAgreement.setOriginDocumentID(original.getId());

		    // Persist all DocumentResults asynchronously
		    DeferredDocResults deferredDocResults = new DeferredDocResults(documentAgreement, recoded.getId(), user);
		    Queue queue = QueueFactory.getQueue("DocumentResultQueue");

		    queue.addAsync(com.google.appengine.api.taskqueue.TaskOptions.Builder.withPayload(deferredDocResults));

		}
	    }
	}

	FMeasureResult totalAgreement = FMeasure.calculateAverageAgreement(documentAgreements);
	TabularReportRow fmeasureRow = FMeasureResultConverter.fmeasureResultToTabularReportRow(totalAgreement, project.getCreatorName());
	result.setReportRow(fmeasureRow.toString());
    }

}
