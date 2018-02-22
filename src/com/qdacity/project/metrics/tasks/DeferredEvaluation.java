package com.qdacity.project.metrics.tasks;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.jdo.PersistenceManager;


import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.taskqueue.DeferredTask;
import com.google.api.server.spi.auth.common.User;
import com.qdacity.PMF;
import com.qdacity.endpoint.CodeSystemEndpoint;
import com.qdacity.endpoint.TextDocumentEndpoint;
import com.qdacity.endpoint.ValidationEndpoint;
import com.qdacity.endpoint.inputconverter.IdCsvStringToLongList;
import com.qdacity.project.ProjectType;
import com.qdacity.project.ValidationProject;
import com.qdacity.project.data.TextDocument;
import com.qdacity.project.metrics.*;
import com.qdacity.project.metrics.algorithms.FMeasure;
import com.qdacity.project.metrics.algorithms.datastructures.converter.FMeasureResultConverter;
import com.qdacity.project.metrics.tasks.algorithms.DeferredAlgorithmEvaluation;
import com.qdacity.project.metrics.tasks.algorithms.DeferredAlgorithmTaskQueue;
import com.qdacity.project.metrics.tasks.algorithms.DeferredFMeasureEvaluation;
import com.qdacity.project.metrics.tasks.algorithms.DeferredFleissKappaEvaluation;
import com.qdacity.project.metrics.tasks.algorithms.DeferredKrippendorffsAlphaEvaluation;

public abstract class DeferredEvaluation implements DeferredTask {

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
    private ProjectType projectType;

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

    public void setProjectType(ProjectType projectType) {
        this.projectType = projectType;
    }

    public ProjectType getProjectType() {
        return projectType;
    }

    public EvaluationMethod getEvaluationMethod() {
        return evaluationMethod;
    }

    public EvaluationUnit getEvalUnit() {
        return evalUnit;
    }

    public List<ValidationProject> getValidationProjectsFromUsers() {
        return this.validationProjectsFromUsers;
    }

    public void setValidationProjectsFromUsers(List<ValidationProject> validationProjectsFromUsers) {
        this.validationProjectsFromUsers = validationProjectsFromUsers;
    }

    @Override
    public void run() {
	long startTime = System.nanoTime();

	initProjects();

	taskQueue = new DeferredAlgorithmTaskQueue();

	Report report = initReport();

	try {
	    switch (evaluationMethod) {
		case F_MEASURE:
		    Collection<TextDocument> originalDocs;
		    originalDocs = getOriginalDocs(docIDs);
		    calculateFMeasure(originalDocs, report);
		    break;
		case KRIPPENDORFFS_ALPHA:
		    calculateKrippendorffsAlpha(report);
		    break;
		case FLEISS_KAPPA:
		    calculateFleissKappa(report);
		    break;
	    }

	} catch (Exception ex) {
	    Logger.getLogger(DeferredEvaluation.class.getName()).log(Level.SEVERE, null, ex);
	}
	long elapsed = System.nanoTime() - startTime;
	Logger.getLogger("logger").log(Level.WARNING, "Time for ValidationReport: " + elapsed);

    }

    public abstract Report initReport();

    /**
     * prepares the validationProjectsFromUsers so it contains the project in
     * the given revision from all users.
     */
    public abstract void initProjects();

    private Collection<TextDocument> getOriginalDocs(List<Long> docIDs) throws UnauthorizedException {
	TextDocumentEndpoint tde = new TextDocumentEndpoint();
	Collection<TextDocument> originalDocs;
	originalDocs = tde.getTextDocument(revisionID, ProjectType.REVISION, user).getItems(); // FIXME put in Memcache, so for each validationResult it does not have to be fetched again
	orignalDocIDs = new ArrayList<>();
	for (TextDocument textDocument : originalDocs) {

	    if (docIDs.contains(textDocument.getId())) {
		TextDocumentEndpoint.putTextDocumentToMemcache(textDocument);
		orignalDocIDs.add(textDocument.getId());
	    }
	}
	return originalDocs;
    }

    private void calculateFMeasure(Collection<TextDocument> originalDocs, Report report) {
	TabularValidationReportRow fmeasureHeaderRow = new TabularValidationReportRow("Coder,FMeasure,Recall,Precision");
        report.setAverageAgreementHeader(fmeasureHeaderRow);
        report.setDetailedAgreementHeader(fmeasureHeaderRow);
	try {

	    if (this.projectType == ProjectType.VALIDATION) {
            //We have more than one validationProject, because each user has a copy. Looping over validationProjects means looping over Users here!
            for (ValidationProject validationProject : validationProjectsFromUsers) {
                DeferredFMeasureEvaluation deferredValidation = new DeferredFMeasureEvaluation(validationProject, orignalDocIDs, report.getId(), user, evalUnit);
                Logger.getLogger("logger").log(Level.INFO, "Starting ValidationProject : " + validationProject.getId());
                taskQueue.launchInTaskQueue(deferredValidation);
            }
            taskQueue.waitForTasksWhichCreateAnValidationResultToFinish(validationProjectsFromUsers.size(), report.getId(), user);
        }

	    aggregateDocAgreement(report);

	    Logger.getLogger("logger").log(Level.INFO, "Generating Agreement Map for report : " + report.getDocumentResults().size());

	    FMeasure.generateAgreementMaps(report.getDocumentResults(), originalDocs);

	    getPersistenceManager().makePersistent(report);

	} catch (UnauthorizedException e) {
	    Logger.getLogger("logger").log(Level.INFO, "User not authorized: " + user.getEmail());
	    e.printStackTrace();
	} catch (InterruptedException | ExecutionException e) {
	    e.printStackTrace();
	} finally {
	    getPersistenceManager().close();
	}
    }

    private void aggregateDocAgreement(Report report) throws UnauthorizedException {
	List<FMeasureResult> validationCoderAvg = new ArrayList<>();
	Map<Long, List<FMeasureResult>> agreementByDoc = new HashMap<>();
	Map<Long, String> documentNames = new HashMap<>();

	ValidationEndpoint ve = new ValidationEndpoint();
	List<ValidationResult> validationResults = ve.listValidationResults(report.getId(), user);
	Logger.getLogger("logger").log(Level.WARNING, " So many results " + validationResults.size() + " for report " + report.getId() + " at time " + System.currentTimeMillis());
	for (ValidationResult validationResult : validationResults) {
	    FMeasureResult resultParagraphAgreement = FMeasureResultConverter.tabularValidationReportRowToFMeasureResult(new TabularValidationReportRow(validationResult.getReportRow()));
	    if (!(resultParagraphAgreement.getPrecision() == 1 && resultParagraphAgreement.getRecall() == 0)) {
		validationCoderAvg.add(resultParagraphAgreement);
	    }

	    List<DocumentResult> docResults = ve.listDocumentResults(validationResult.getId(), user);

	    for (DocumentResult documentResult : docResults) {
				Long revisionDocumentID = documentResult.getOriginDocumentID();
				documentNames.put(revisionDocumentID, documentResult.getDocumentName());
				DocumentResult documentResultForAggregation = new DocumentResult(documentResult);
				documentResultForAggregation.setDocumentID(revisionDocumentID);
				report.addDocumentResult(documentResultForAggregation);

				FMeasureResult docAgreement = FMeasureResultConverter.tabularValidationReportRowToFMeasureResult(new TabularValidationReportRow(documentResultForAggregation.getReportRow()));

				if (!(docAgreement.getPrecision() == 1 && docAgreement.getRecall() == 0)) {
					List<FMeasureResult> agreementList = agreementByDoc.get(revisionDocumentID);
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
	    FMeasureResult avgDocAgreement = FMeasure.calculateAverageAgreement(agreementByDoc.get(docID));
	    Logger.getLogger("logger").log(Level.INFO, "From " + agreementByDoc.get(docID).size() + " items, we calculated an F-Measure of " + avgDocAgreement.getFMeasure());
			report.setDocumentResultAverage(docID, FMeasureResultConverter.fmeasureResultToTabularValidationReportRow(avgDocAgreement, documentNames.get(docID)));
	}

	FMeasureResult avgReportAgreement = FMeasure.calculateAverageAgreement(validationCoderAvg);
	report.setAverageAgreementRow(FMeasureResultConverter.fmeasureResultToTabularValidationReportRow(avgReportAgreement, "Average"));
    }

    private PersistenceManager pm = null;

    protected PersistenceManager getPersistenceManager() {
	if (this.pm == null) {
	    this.pm = PMF.get().getPersistenceManager();
	}
	return this.pm;
    }

    /**
     * Calculate K's Alpha between all given users for every given document for
     * every code in the codesystem for the given revisioin.
     *
     * @throws UnauthorizedException if user can not see documents of other
     * users
     */
    private void calculateKrippendorffsAlpha(Report report) throws UnauthorizedException, ExecutionException, InterruptedException {

	Logger.getLogger("logger").log(Level.INFO, "Starting Krippendorffs Alpha");
	Long codeSystemId = null;
	if (projectType == ProjectType.VALIDATION) {
        codeSystemId = validationProjectsFromUsers.get(0).getCodesystemID();
    }
    Map<String, Long> codeNamesAndIds = CodeSystemEndpoint.getCodeNamesAndIds(codeSystemId, user);
	List<String> tableHead = new ArrayList<>();
	List<String> tableAverageHead = new ArrayList<>();
	tableHead.add("Documents \\ Codes");
	tableAverageHead.add("Codes");
	for (String codeName : codeNamesAndIds.keySet()) {
	    tableHead.add(codeName + "");
	    tableAverageHead.add(codeName + "");
	}
        report.setDetailedAgreementHeader(new TabularValidationReportRow(tableHead));
        report.setAverageAgreementHeader(new TabularValidationReportRow(tableAverageHead));

        Map<String, ArrayList<Long>> sameDocumentsFromDifferentRatersMap = null;
        if (projectType == ProjectType.VALIDATION) {
            sameDocumentsFromDifferentRatersMap = TextDocumentEndpoint.getDocumentsFromDifferentValidationProjectsGroupedByName(validationProjectsFromUsers, docIDs, user);
        }


	List<DeferredAlgorithmEvaluation> kAlphaTasks = new ArrayList<>();
	for (String documentTitle : sameDocumentsFromDifferentRatersMap.keySet()) {
	    //create all the tasks
        if (projectType == ProjectType.VALIDATION) {
            kAlphaTasks.add(new DeferredKrippendorffsAlphaEvaluation(validationProjectsFromUsers.get(0), user, report.getId(), documentTitle, evalUnit, new ArrayList(codeNamesAndIds.values()), sameDocumentsFromDifferentRatersMap.get(documentTitle)));
        }
	}

	//Now launch all the Tasks
	taskQueue.launchListInTaskQueue(kAlphaTasks);

	Logger.getLogger("logger").log(Level.INFO, "Krippendorffs Alpha Add Paragraph Agreement ");

	List<ValidationResult> resultRows = taskQueue.waitForTasksWhichCreateAnValidationResultToFinish(kAlphaTasks.size(), report.getId(), user);

        report.setAverageAgreement(calculateAverageAgreement(resultRows));

	getPersistenceManager().makePersistent(report);
    }

    /**
     * Calculates the averageAgreement between ValidationResults using
     * simple average calculation.
     *
     * @param myRows the rows where you want to calculate the average
     * @return a new row containing the average
     */
    private TabularValidationReportRow calculateAverageAgreement(List<ValidationResult> myRows) {
	List<String> averageColumns = new ArrayList<>();
	averageColumns.add("AVERAGE");
	if (myRows.size() > 0) {
	    List<String> masterCells = new TabularValidationReportRow(myRows.get(0).getReportRow()).getCells();
	    for (int i = 1; i < masterCells.size(); i++) { //SKIP first cell as it is just label
		double sum = 0;
		for (ValidationResult row : myRows) {
		    sum += new Double(new TabularValidationReportRow(row.getReportRow()).getCells().get(i));
		}
		double average = sum / myRows.size();
		averageColumns.add(average + "");
	    }
	}
	return new TabularValidationReportRow(averageColumns);
    }

    /**
     * FleissKappa per Document per Code (as Codes are not Categories).
     * @throws UnauthorizedException 
     */
    private void calculateFleissKappa(Report report) throws Exception {
	List<DeferredAlgorithmEvaluation> deferredEvals = new ArrayList<>();
	Long codeSystemId = null;
	int amountRatersSize = 0;
	if (projectType == ProjectType.VALIDATION) {
        codeSystemId = validationProjectsFromUsers.get(0).getCodesystemID();
        amountRatersSize = validationProjectsFromUsers.size();
    }
	//get all Codes
	Map<String, Long> codeNamesAndIds = CodeSystemEndpoint.getCodeNamesAndIds(codeSystemId, user);
	
	//Amount Raters
	int amountRaters = amountRatersSize;
	if(amountRaters < 2) {
	    throw new Exception("With less than two raters, there is no valid Fleiss Kappa Evaluation possible.");
	}
	
	//get all Document Ids from every Rater
	Map<String, ArrayList<Long>> sameDocumentsFromDifferentRatersMap = null;
	if (projectType == ProjectType.VALIDATION) {
        sameDocumentsFromDifferentRatersMap = TextDocumentEndpoint.getDocumentsFromDifferentValidationProjectsGroupedByName(validationProjectsFromUsers, docIDs, user);
    }
	List<String> headerCells = new ArrayList<>();
	headerCells.add("Document \\ Code");
	headerCells.add("Average All Codes");
	headerCells.addAll(codeNamesAndIds.keySet());

        report.setDetailedAgreementHeader(new TabularValidationReportRow(headerCells));

	//Create Deferred Evaluations
	for(String docName : sameDocumentsFromDifferentRatersMap.keySet()) {
        Logger.getLogger("logger").log(Level.INFO, "Create Deferred Fleiss Kappa Task for Document " + docName);
        if (projectType == ProjectType.VALIDATION) {
            deferredEvals.add(new DeferredFleissKappaEvaluation(sameDocumentsFromDifferentRatersMap.get(docName), codeNamesAndIds, docName, amountRaters, validationProjectsFromUsers.get(0), user, report.getId(), evalUnit));
        }
    }
	
	//Run deferred Evaluations
	taskQueue.launchListInTaskQueue(deferredEvals);
	
	int amountOfValidationResults = sameDocumentsFromDifferentRatersMap.keySet().size();
	List<ValidationResult> resultRows = taskQueue.waitForTasksWhichCreateAnValidationResultToFinish(amountOfValidationResults, report.getId(), user);
	List<String> avgHeaderCells = new ArrayList<>();
	avgHeaderCells.add("");
	avgHeaderCells.addAll(sameDocumentsFromDifferentRatersMap.keySet());
        report.setAverageAgreement(calculateAverageAgreementPerRow(resultRows));
        report.setAverageAgreementHeader(new TabularValidationReportRow(avgHeaderCells));
	
	getPersistenceManager().makePersistent(report);
    }

    /**
     * calculates the average of each row and writes the result in one average row
     * @param resultRows
     * @return 
     */
    private TabularValidationReportRow calculateAverageAgreementPerRow(List<ValidationResult> resultRows) {
	List<String> averagesPerRow = new ArrayList<>();
	averagesPerRow.add("AVERAGE");
	for(ValidationResult row : resultRows) {
	    TabularValidationReportRow rowForAvg = new TabularValidationReportRow(row.getReportRow());
	    double sum = 0;
	    for(int i = 1; i < rowForAvg.getCells().size(); i++){
		sum += new Double(rowForAvg.getCells().get(i));
	    }
	    double avg = sum / rowForAvg.getCells().size();
	    averagesPerRow.add(""+avg);
	}
	return new TabularValidationReportRow(averagesPerRow);
    }

}
