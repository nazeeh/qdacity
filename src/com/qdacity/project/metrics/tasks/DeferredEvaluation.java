package com.qdacity.project.metrics.tasks;

import com.google.api.server.spi.response.CollectionResponse;
import java.util.ArrayList;
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
import com.qdacity.endpoint.CodeSystemEndpoint;
import com.qdacity.endpoint.TextDocumentEndpoint;
import com.qdacity.endpoint.ValidationEndpoint;
import com.qdacity.endpoint.inputconverter.IdCsvStringToLongList;
import com.qdacity.project.ValidationProject;
import com.qdacity.project.codesystem.Code;
import com.qdacity.project.data.TextDocument;
import com.qdacity.project.metrics.algorithms.FMeasure;
import com.qdacity.project.metrics.DocumentResult;
import com.qdacity.project.metrics.EvaluationMethod;
import com.qdacity.project.metrics.EvaluationUnit;
import com.qdacity.project.metrics.ParagraphAgreement;
import com.qdacity.project.metrics.ValidationReport;
import com.qdacity.project.metrics.ValidationResult;
import com.qdacity.project.metrics.algorithms.datastructures.ReliabilityData;
import com.qdacity.project.metrics.algorithms.datastructures.converter.ReliabilityDataGenerator;

public class DeferredEvaluation implements DeferredTask {

    private static final long serialVersionUID = 8021773396438274981L;
    Long revisionID;
    String name;
    User user;
    private final EvaluationMethod evaluationMethod;
    private final EvaluationUnit evalUnit;
    private List<Long> orignalDocIDs;
    private final List<Long> raterIds;
    private final List<Long> docIDs;
    private List<ValidationProject> validationProjectsFromUsers;
    private ValidationReport validationReport;

    public DeferredEvaluation(Long revisionID, String name, String docIDsString, String evaluationMethod, String unitOfCoding, String raterIds, User user) {
	super();
	this.revisionID = revisionID;
	this.name = name;
	this.user = user;
	this.evaluationMethod = EvaluationMethod.fromString(evaluationMethod);
	this.evalUnit = EvaluationUnit.fromString(unitOfCoding);
	this.raterIds = IdCsvStringToLongList.convert(raterIds);
	this.docIDs = IdCsvStringToLongList.convert(docIDsString);
    }

    @Override
    public void run() {
	long startTime = System.nanoTime();

	initValidationProjects();

	initValidationReport();

	try {
	    switch (evaluationMethod) {
		case F_MEASURE:
		    Collection<TextDocument> originalDocs;
		    originalDocs = getOriginalDocs(docIDs); //TODO auslagern
		    calculateFMeasure(originalDocs);
		    break;
		case KRIPPENDORFFS_ALPHA:
		    calculateKrippendorffsAlpha();
		    break;
		case COHENS_CAPPA:
		    calculateCohensKappa();
		    break;
	    }

	} catch (UnauthorizedException ex) {
	    Logger.getLogger(DeferredEvaluation.class.getName()).log(Level.SEVERE, null, ex);
	}
	long elapsed = System.nanoTime() - startTime;
	Logger.getLogger("logger").log(Level.WARNING, "Time for ValidationReport: " + elapsed);

    }

    private void initValidationReport() {
	validationReport = new ValidationReport();
	getPersistenceManager().makePersistent(validationReport); // Generate ID right away so we have an ID to pass to ValidationResults
	validationReport.setRevisionID(revisionID);
	validationReport.setName(name);
	validationReport.setDatetime(new Date());
	validationReport.setProjectID(validationProjectsFromUsers.get(0).getProjectID());
    }

    /**
     * prepares the validationProjectsFromUsers so it contains the project in
     * the given revision from all users.
     */
    private void initValidationProjects() {
	Query q;
	q = getPersistenceManager().newQuery(ValidationProject.class, "revisionID  == :revisionID");

	Map<String, Long> params = new HashMap<>();
	params.put("revisionID", revisionID);
	this.validationProjectsFromUsers = (List<ValidationProject>) q.executeWithMap(params);
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

    private void calculateFMeasure(Collection<TextDocument> originalDocs) {
	try {

	    List<Future<TaskHandle>> futures = new ArrayList<>();
	    //We have more than one validationProject, because each user has a copy. Looping over validationProjects means looping over Users here!
	    for (ValidationProject validationProject : validationProjectsFromUsers) {
		validationProject.getId(); // Lazy Fetch?
		Logger.getLogger("logger").log(Level.INFO, "Starting ValidationProject : " + validationProject.getId());
		DeferredFMeasureEvaluation deferredResults = new DeferredFMeasureEvaluation(validationProject, docIDs, orignalDocIDs, validationReport.getId(), user);

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
	    while (valResults.size() != validationProjectsFromUsers.size()) {

		ValidationEndpoint ve = new ValidationEndpoint();
		valResults = ve.listValidationResults(validationReport.getId(), user);
		Logger.getLogger("logger").log(Level.WARNING, " So many results " + valResults.size() + " for report " + validationReport.getId() + " at time " + System.currentTimeMillis());
		if (valResults.size() != validationProjectsFromUsers.size()) {
		    Thread.sleep(10000);
		}
	    }

	    Logger.getLogger("logger").log(Level.INFO, "All Tasks Done for tasks: ");
	    Logger.getLogger("logger").log(Level.INFO, "Is task finished? : " + futures.get(0).isDone());

	    aggregateDocAgreement(validationReport);

	    Logger.getLogger("logger").log(Level.INFO, "Generating Agreement Map for report : " + validationReport.getDocumentResults().size());

	    FMeasure.generateAgreementMaps(validationReport.getDocumentResults(), originalDocs);

	    getPersistenceManager().makePersistent(validationReport);

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
	    getPersistenceManager().close();
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
	    ParagraphAgreement avgDocAgreement = FMeasure.calculateAverageAgreement(agreementByDoc.get(docID));
	    Logger.getLogger("logger").log(Level.INFO, "From " + agreementByDoc.get(docID).size() + " items, we calculated an F-Measuzre of " + avgDocAgreement.getfMeasure());
	    report.setDocumentResultAverage(docID, avgDocAgreement);
	}

	ParagraphAgreement avgReportAgreement = FMeasure.calculateAverageAgreement(validationCoderAvg);
	report.setParagraphAgreement(avgReportAgreement);
    }

    //TODO als singleton?
    private PersistenceManager getPersistenceManager() {
	return PMF.get().getPersistenceManager();
    }

    /**
     * Calculate K's Alpha between all given users for every given document for
     * every code in the codesystem for the given revision.
     *
     * @throws UnauthorizedException if user can not see documents of other
     * users
     */
    private void calculateKrippendorffsAlpha() throws UnauthorizedException {
	List<Long> codeIds = findCodeIds();
	List<TextDocument> textDocuments = new ArrayList<>();

	TextDocumentEndpoint tde = new TextDocumentEndpoint();
	//Looping over validationProjects has the effect of retrieving documents from all users
	for (ValidationProject project : validationProjectsFromUsers) {
	    //gets the documents from the validationProject of a user with the rights of our user.
	    textDocuments.addAll(tde.getTextDocument(project.getId(), "VALIDATION", user).getItems());
	    //TODO vielleicht noch mal filtern hier (man soll ja nach Textdocument filtern können)
	}
	List<ReliabilityData> reliabilityData = new ReliabilityDataGenerator(evalUnit).generate(textDocuments, codeIds);

	for (ReliabilityData rData : reliabilityData) {
	    //TODO für jede Data neuen Task starten
	}
    }

    private void calculateCohensKappa() {
	throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    private List<Long> findCodeIds() throws UnauthorizedException {
	Long codesystemId = validationProjectsFromUsers.get(0).getCodesystemID();

	CodeSystemEndpoint cse = new CodeSystemEndpoint();
	CollectionResponse<Code> codes = cse.getCodeSystem(codesystemId, null, null, user);
	List<Long> codeIds = new ArrayList<>();
	for (Code code : codes.getItems()) {
	    //Using CodeId (Actual Code Id) and NOT id (Database Key)
	    codeIds.add(code.getCodeID());
	}
	return codeIds;
    }

}
