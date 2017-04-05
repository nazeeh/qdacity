package com.qdacity.project.metrics.tasks;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.jdo.PersistenceManager;
import javax.jdo.Query;

import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.memcache.Expiration;
import com.google.appengine.api.memcache.MemcacheService;
import com.google.appengine.api.memcache.MemcacheServiceFactory;
import com.google.appengine.api.taskqueue.DeferredTask;
import com.google.appengine.api.taskqueue.Queue;
import com.google.appengine.api.taskqueue.QueueFactory;
import com.google.appengine.api.taskqueue.TaskHandle;
import com.google.appengine.api.users.User;
import com.qdacity.PMF;
import com.qdacity.endpoint.TextDocumentEndpoint;
import com.qdacity.endpoint.ValidationEndpoint;
import com.qdacity.project.ValidationProject;
import com.qdacity.project.data.TextDocument;
import com.qdacity.project.metrics.Agreement;
import com.qdacity.project.metrics.DocumentResult;
import com.qdacity.project.metrics.EvaluationMethod;
import com.qdacity.project.metrics.ParagraphAgreement;
import com.qdacity.project.metrics.ValidationReport;
import com.qdacity.project.metrics.ValidationResult;
import com.qdacity.project.metrics.algorithms.datastructures.ReliabilityData;
import com.qdacity.project.metrics.algorithms.datastructures.converter.ReliabilityDataGenerator;

public class DeferredEvaluation implements DeferredTask {

    private static final long serialVersionUID = 8021773396438274981L;
    Long revisionID;
    String name;
    String docIDsString;
    User user;
    private final EvaluationMethod evaluationMethod;
    private List<Long> orignalDocIDs;

    public DeferredEvaluation(Long revisionID, String name, String docIDsString, String evaluationMethod, User user) {
        super();
        this.revisionID = revisionID;
        this.name = name;
        this.docIDsString = docIDsString;
        this.user = user;
        this.evaluationMethod = EvaluationMethod.fromString(evaluationMethod);
    }

    @Override
    public void run() {
        long startTime = System.nanoTime();

        List<String> docIDArray = Arrays.asList(docIDsString.split("\\s*,\\s*"));
        List<Long> docIDs = new ArrayList<Long>();
        for (String string : docIDArray) {
            docIDs.add(Long.parseLong(string));
        }

        Collection<TextDocument> originalDocs;
        try {
            originalDocs = getOriginalDocs(docIDs);

            switch (evaluationMethod) {
                case F_MEASURE_PARAGRAPH:
                    calculateFMeasure(docIDs, originalDocs);
                    break;
                case KRIPPENDORFFS_ALPHA:
                    calculateKrippendorffsAlpha(docIDs, originalDocs);
                    break;
                case COHENS_CAPPA:
                    calculateCohensKappa(docIDs, originalDocs);
                    break;
            }

        } catch (UnauthorizedException ex) {
            Logger.getLogger(DeferredEvaluation.class.getName()).log(Level.SEVERE, null, ex);
        }
        long elapsed = System.nanoTime() - startTime;
        Logger.getLogger("logger").log(Level.WARNING, "Time for ValidationReport: " + elapsed);

    }

    private Collection<TextDocument> getOriginalDocs(List<Long> docIDs) throws UnauthorizedException {
        TextDocumentEndpoint tde = new TextDocumentEndpoint();
        Collection<TextDocument> originalDocs;
        originalDocs = tde.getTextDocument(revisionID, "REVISION", user).getItems(); // FIXME put in Memcache, so for each validationResult it does not have to be fetched again
        orignalDocIDs = new ArrayList<>();
        for (TextDocument textDocument : originalDocs) {

            if (docIDs.contains(textDocument.getId())) {
                String keyString = KeyFactory.createKeyString(TextDocument.class.toString(), textDocument.getId());
                MemcacheService syncCache = MemcacheServiceFactory.getMemcacheService();
                syncCache.put(keyString, textDocument, Expiration.byDeltaSeconds(300));

                orignalDocIDs.add(textDocument.getId());
            }
        }
        return originalDocs;
    }

    private void calculateFMeasure(List<Long> docIDs, Collection<TextDocument> originalDocs) {
        /// Code in this method is all from Andreas.
        PersistenceManager mgr = getPersistenceManager();
        try {
            Query q;
            q = mgr.newQuery(ValidationProject.class, "revisionID  == :revisionID");

            Map<String, Long> params = new HashMap<>();
            params.put("revisionID", revisionID);
            @SuppressWarnings("unchecked")
            List<ValidationProject> validationProjects = (List<ValidationProject>) q.executeWithMap(params);

            for (ValidationProject prj : validationProjects) {
                prj.getId();
            }

            ValidationReport report = new ValidationReport();
            mgr.makePersistent(report); // Generate ID right away so we have an ID to pass to ValidationResults

            report.setRevisionID(revisionID);
            report.setName(name);
            report.setDatetime(new Date());

            report.setProjectID(validationProjects.get(0).getProjectID());

            List<Future<TaskHandle>> futures = new ArrayList<>();

            for (ValidationProject validationProject : validationProjects) {
                validationProject.getId(); // Lazy Fetch?
                Logger.getLogger("logger").log(Level.INFO, "Starting ValidationProject : " + validationProject.getId());
                DeferredValPrjEvaluation deferredResults = new DeferredValPrjEvaluation(validationProject, docIDs, orignalDocIDs, report.getId(), evaluationMethod, user);

                Queue queue = QueueFactory.getQueue("ValidationResultQueue");

                Future<TaskHandle> future = queue.addAsync(com.google.appengine.api.taskqueue.TaskOptions.Builder.withPayload(deferredResults));

                futures.add(future);
            }

            Logger.getLogger("logger").log(Level.INFO, "Waiting for tasks: " + futures.size());

            for (Future<TaskHandle> future : futures) {
                Logger.getLogger("logger").log(Level.INFO, "Is task finished? : " + future.isDone());
                future.get();

            }

            // Poll every 10 seconds. TODO: find better solution
            List<ValidationResult> valResults = new ArrayList<ValidationResult>();
            while (valResults.size() != validationProjects.size()) {

                ValidationEndpoint ve = new ValidationEndpoint();
                valResults = ve.listValidationResults(report.getId(), user);
                Logger.getLogger("logger").log(Level.WARNING, " So many results " + valResults.size() + " for report " + report.getId() + " at time " + System.currentTimeMillis());
                if (valResults.size() != validationProjects.size()) {
                    Thread.sleep(10000);
                }
            }

            Logger.getLogger("logger").log(Level.INFO, "All Tasks Done for tasks: ");
            Logger.getLogger("logger").log(Level.INFO, "Is task finished? : " + futures.get(0).isDone());

            aggregateDocAgreement(report);

            Logger.getLogger("logger").log(Level.INFO, "Generating Agreement Map for report : " + report.getDocumentResults().size());

            Agreement.generateAgreementMaps(report.getDocumentResults(), originalDocs);

            mgr.makePersistent(report);

        } catch (UnauthorizedException e) {
            Logger.getLogger("logger").log(Level.INFO, "User not authorized: " + user.getEmail());
            // TODO Auto-generated catch block
            e.printStackTrace();
        } catch (InterruptedException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        } catch (ExecutionException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        } finally {
            mgr.close();
        }
    }

    private void aggregateDocAgreement(ValidationReport report) throws UnauthorizedException {
        List<ParagraphAgreement> validationCoderAvg = new ArrayList<ParagraphAgreement>();
        Map<Long, List<ParagraphAgreement>> agreementByDoc = new HashMap<Long, List<ParagraphAgreement>>();

        ValidationEndpoint ve = new ValidationEndpoint();
        List<ValidationResult> validationResults = ve.listValidationResults(report.getId(), user);
        Logger.getLogger("logger").log(Level.WARNING, " So many results " + validationResults.size() + " for report " + report.getId() + " at time " + System.currentTimeMillis());
        for (ValidationResult validationResult : validationResults) {
            ParagraphAgreement resultParagraphAgreement = validationResult.getParagraphAgreement();
            if (!(resultParagraphAgreement.getPrecision() == 1 && resultParagraphAgreement.getRecall() == 0)) {
                validationCoderAvg.add(resultParagraphAgreement);
            }

            List<DocumentResult> docResults = ve.listDocumentResults(validationResult.getId(), user);

            for (DocumentResult documentResult : docResults) {
                Long revisionDocumentID = documentResult.getOriginDocumentID();

                DocumentResult documentResultForAggregation = new DocumentResult(documentResult);
                documentResultForAggregation.setDocumentID(revisionDocumentID);
                report.addDocumentResult(documentResultForAggregation);

                ParagraphAgreement docAgreement = documentResultForAggregation.getParagraphAgreement();

                if (!(docAgreement.getPrecision() == 1 && docAgreement.getRecall() == 0)) {
                    List<ParagraphAgreement> agreementList = agreementByDoc.get(revisionDocumentID);
                    if (agreementList == null) {
                        agreementList = new ArrayList<ParagraphAgreement>();
                    }
                    agreementList.add(docAgreement);
                    agreementByDoc.put(revisionDocumentID, agreementList);
                    // agreementByDoc.putIfAbsent(key, value)
                }

            }

        }

        for (Long docID : agreementByDoc.keySet()) {
            ParagraphAgreement avgDocAgreement = Agreement.calculateAverageAgreement(agreementByDoc.get(docID));
            Logger.getLogger("logger").log(Level.INFO, "From " + agreementByDoc.get(docID).size() + " items, we calculated an F-Measuzre of " + avgDocAgreement.getfMeasure());
            report.setDocumentResultAverage(docID, avgDocAgreement);
        }

        ParagraphAgreement avgReportAgreement = Agreement.calculateAverageAgreement(validationCoderAvg);
        report.setParagraphAgreement(avgReportAgreement);
    }

    private static PersistenceManager getPersistenceManager() {
        return PMF.get().getPersistenceManager();
    }

    private void calculateKrippendorffsAlpha(List<Long> docIDs, Collection<TextDocument> originalDocs) throws UnauthorizedException {
        List<User> usersInProject = null;
        TextDocumentEndpoint tde = new TextDocumentEndpoint();
        
        Map<User, List<TextDocument>> userDocs = new HashMap<>();
        for(User user: usersInProject) {
            originalDocs = tde.getTextDocument(revisionID, "REVISION", user).getItems();
            ///TODO???
        }
        ReliabilityData reliabilityData = new ReliabilityDataGenerator().generate(userDocs);
        
    }

    private void calculateCohensKappa(List<Long> docIDs, Collection<TextDocument> originalDocs) {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

}
