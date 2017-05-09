package com.qdacity.project.metrics.tasks;

import com.qdacity.project.metrics.tasks.algorithms.DeferredFMeasureEvaluation;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;
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
import com.google.appengine.api.users.User;
import com.qdacity.PMF;
import com.qdacity.endpoint.CodeSystemEndpoint;
import com.qdacity.endpoint.TextDocumentEndpoint;
import com.qdacity.endpoint.ValidationEndpoint;
import com.qdacity.endpoint.inputconverter.IdCsvStringToLongList;
import com.qdacity.project.ValidationProject;
import com.qdacity.project.data.TextDocument;
import com.qdacity.project.metrics.algorithms.FMeasure;
import com.qdacity.project.metrics.DocumentResult;
import com.qdacity.project.metrics.EvaluationMethod;
import com.qdacity.project.metrics.EvaluationUnit;
import com.qdacity.project.metrics.ParagraphAgreement;
import com.qdacity.project.metrics.TabularValidationReport;
import com.qdacity.project.metrics.ValidationReport;
import com.qdacity.project.metrics.ValidationResult;
import com.qdacity.project.metrics.algorithms.datastructures.ReliabilityData;
import com.qdacity.project.metrics.algorithms.datastructures.converter.ParagraphAgreementConverter;
import com.qdacity.project.metrics.algorithms.datastructures.converter.ReliabilityDataGenerator;
import com.qdacity.project.metrics.tasks.algorithms.DeferredAlgorithmEvaluation;
import com.qdacity.project.metrics.tasks.algorithms.DeferredAlgorithmTaskQueue;
import com.qdacity.project.metrics.tasks.algorithms.DeferredKrippendorffsAlphaEvaluation;

public class DeferredEvaluation implements DeferredTask {

    private static final long serialVersionUID = 8021773396438274981L;
    Long revisionID;
    String name;
    User user;
    private final EvaluationMethod evaluationMethod;
    private final EvaluationUnit evalUnit;
    private List<Long> orignalDocIDs;
    private final List<Long> raterIds; //TODO?
    private final List<Long> docIDs;
    private List<ValidationProject> validationProjectsFromUsers;
    private DeferredAlgorithmTaskQueue taskQueue;

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

	taskQueue = new DeferredAlgorithmTaskQueue();

	try {
	    switch (evaluationMethod) {
		case F_MEASURE:
		    Collection<TextDocument> originalDocs;
		    originalDocs = getOriginalDocs(docIDs);
		    calculateFMeasure(originalDocs);
		    break;
		case KRIPPENDORFFS_ALPHA:
		    calculateKrippendorffsAlpha();
		    break;
		case COHENS_CAPPA:
		    calculateCohensKappa();
		    break;
	    }

	} catch (Exception ex) {
	    Logger.getLogger(DeferredEvaluation.class.getName()).log(Level.SEVERE, null, ex);
	}
	long elapsed = System.nanoTime() - startTime;
	Logger.getLogger("logger").log(Level.WARNING, "Time for ValidationReport: " + elapsed);

    }

    private ValidationReport initValidationReportFMeasure() {
	ValidationReport validationReport = new ValidationReport();
	getPersistenceManager().makePersistent(validationReport); // Generate ID right away so we have an ID to pass to ValidationResults
	validationReport.setRevisionID(revisionID);
	validationReport.setName(name);
	validationReport.setDatetime(new Date());
	validationReport.setProjectID(validationProjectsFromUsers.get(0).getProjectID());
	return validationReport;
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
	//Hint: Only gets the validationProjects from Users, but not the project itself. This behaviour is wanted.
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
	ValidationReport validationReport = initValidationReportFMeasure();
	try {

	    //We have more than one validationProject, because each user has a copy. Looping over validationProjects means looping over Users here!
	    for (ValidationProject validationProject : validationProjectsFromUsers) {
		DeferredFMeasureEvaluation deferredValidation = new DeferredFMeasureEvaluation(validationProject, docIDs, orignalDocIDs, validationReport.getId(), user);
		Logger.getLogger("logger").log(Level.INFO, "Starting ValidationProject : " + validationProject.getId());
		taskQueue.launchInTaskQueue(deferredValidation);
	    }

	    taskQueue.waitForTasksWhichCreateAnValidationResultToFinish(validationProjectsFromUsers.size(), validationReport.getId(), user);

	    aggregateDocAgreement(validationReport);

	    Logger.getLogger("logger").log(Level.INFO, "Generating Agreement Map for report : " + validationReport.getDocumentResults().size());

	    FMeasure.generateAgreementMaps(validationReport.getDocumentResults(), originalDocs);

	    getPersistenceManager().makePersistent(validationReport);

	} catch (UnauthorizedException e) {
	    Logger.getLogger("logger").log(Level.INFO, "User not authorized: " + user.getEmail());
	    e.printStackTrace();
	} catch (InterruptedException | ExecutionException e) {
	    e.printStackTrace();
	} finally {
	    getPersistenceManager().close();
	}
    }

    private void aggregateDocAgreement(ValidationReport report) throws UnauthorizedException {
	List<ParagraphAgreement> validationCoderAvg = new ArrayList<>();
	Map<Long, List<ParagraphAgreement>> agreementByDoc = new HashMap<>();

	ValidationEndpoint ve = new ValidationEndpoint();
	List<ValidationResult> validationResults = ve.listValidationResults(report.getId(), user);
	Logger.getLogger("logger").log(Level.WARNING, " So many results " + validationResults.size() + " for report " + report.getId() + " at time " + System.currentTimeMillis());
	for (ValidationResult validationResult : validationResults) {
	    ParagraphAgreement resultParagraphAgreement = ParagraphAgreementConverter.tabularValidationReportRowToParagraphAgreement(validationResult.getReportRow());
	    if (!(resultParagraphAgreement.getPrecision() == 1 && resultParagraphAgreement.getRecall() == 0)) {
		validationCoderAvg.add(resultParagraphAgreement);
	    }

	    List<DocumentResult> docResults = ve.listDocumentResults(validationResult.getId(), user);

	    for (DocumentResult documentResult : docResults) {
		Long revisionDocumentID = documentResult.getOriginDocumentID();

		DocumentResult documentResultForAggregation = new DocumentResult(documentResult);
		documentResultForAggregation.setDocumentID(revisionDocumentID);
		report.addDocumentResult(documentResultForAggregation);

		ParagraphAgreement docAgreement = ParagraphAgreementConverter.tabularValidationReportRowToParagraphAgreement(documentResultForAggregation.getReportRow());

		if (!(docAgreement.getPrecision() == 1 && docAgreement.getRecall() == 0)) {
		    List<ParagraphAgreement> agreementList = agreementByDoc.get(revisionDocumentID);
		    if (agreementList == null) {
			agreementList = new ArrayList<>();
		    }
		    agreementList.add(docAgreement);
		    agreementByDoc.put(revisionDocumentID, agreementList);
		    // agreementByDoc.putIfAbsent(key, value)
		}
	    }
	}

	for (Long docID : agreementByDoc.keySet()) {
	    ParagraphAgreement avgDocAgreement = FMeasure.calculateAverageAgreement(agreementByDoc.get(docID));
	    Logger.getLogger("logger").log(Level.INFO, "From " + agreementByDoc.get(docID).size() + " items, we calculated an F-Measure of " + avgDocAgreement.getFMeasure());
	    report.setDocumentResultAverage(docID, ParagraphAgreementConverter.paragraphAgreementToTabularValidationReportRow(avgDocAgreement, null, "Average"));
	}

	ParagraphAgreement avgReportAgreement = FMeasure.calculateAverageAgreement(validationCoderAvg);
	report.setParagraphAgreement(avgReportAgreement);
    }

    private PersistenceManager pm = null;

    private PersistenceManager getPersistenceManager() {
	if (this.pm == null) {
	    this.pm = PMF.get().getPersistenceManager();
	}
	return this.pm;
    }

    /**
     * Calculate K's Alpha between all given users for every given document for
     * every code in the codesystem for the given revision.
     *
     * @throws UnauthorizedException if user can not see documents of other
     * users
     */
    private void calculateKrippendorffsAlpha() throws UnauthorizedException, ExecutionException, InterruptedException {
	TabularValidationReport tabularValidationReport = initTabularValidationReport();

	Logger.getLogger("logger").log(Level.INFO, "Starting Krippendorffs Alpha");
	List<Long> codeIds = CodeSystemEndpoint.getCodeIds(validationProjectsFromUsers.get(0).getCodesystemID(), user);

	List<String> tableHead = new ArrayList<>();
	tableHead.add("Documents \\ Codes");
	for (Long codeId : codeIds) {
	    tableHead.add(codeId + ""); //TODO get Name of Code From Codesystem
	}
	tabularValidationReport.setHeadRow(tableHead);

	Map<String, List<TextDocument>> sameDocumentsFromDifferentRatersMap
		= TextDocumentEndpoint.getDocumentsFromDifferentValidationProjectsGroupedByName(validationProjectsFromUsers, user);
	//TODO nach Textdocumenten filtern!

	//Convert TextDocuments to Reliability Data Matrix, which will be input for Krippendorffs Alpha
	List<DeferredAlgorithmEvaluation> kAlphaTasks = new ArrayList<>();
	for (String documentTitle : sameDocumentsFromDifferentRatersMap.keySet()) {
	    List<ReliabilityData> reliabilityData = new ReliabilityDataGenerator(evalUnit).generate(sameDocumentsFromDifferentRatersMap.get(documentTitle), codeIds);
	    //create all the tasks with the reliability Data
	    kAlphaTasks.add(new DeferredKrippendorffsAlphaEvaluation(reliabilityData, validationProjectsFromUsers.get(0), user, tabularValidationReport.getId(), documentTitle));
	}

	//Now launch all the Tasks
	taskQueue.launchListInTaskQueue(kAlphaTasks);

	Logger.getLogger("logger").log(Level.INFO, "Krippendorffs Alpha Add Paragraph Agreement ");

	getPersistenceManager().makePersistent(tabularValidationReport);
    }

    private TabularValidationReport initTabularValidationReport() {
	TabularValidationReport tabularValidationReport = new TabularValidationReport();
	getPersistenceManager().makePersistent(tabularValidationReport); // Generate ID right away so we have an ID to pass to the Algorithm
	tabularValidationReport.setRevisionID(revisionID);
	tabularValidationReport.setName(name);
	tabularValidationReport.setDatetime(new Date());
	tabularValidationReport.setProjectID(validationProjectsFromUsers.get(0).getProjectID());
	tabularValidationReport.setEvaluationUnit(evalUnit);
	return tabularValidationReport;
    }

    private void calculateCohensKappa() {
	throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

}
