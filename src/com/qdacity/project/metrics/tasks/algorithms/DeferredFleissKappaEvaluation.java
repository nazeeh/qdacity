package com.qdacity.project.metrics.tasks.algorithms;

import com.google.appengine.api.users.User;
import com.qdacity.project.ValidationProject;
import com.qdacity.project.metrics.EvaluationUnit;
import com.qdacity.project.metrics.TabularValidationReportRow;
import com.qdacity.project.metrics.algorithms.FleissKappa;
import com.qdacity.project.metrics.algorithms.datastructures.converter.FleissKappaInputDataGenerator;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

public class DeferredFleissKappaEvaluation extends DeferredAlgorithmEvaluation {

    /**
     *
     */
    private static final long serialVersionUID = 4694705956668305444L;
    private final Map<String, Long> codeNamesAndIds;
    private final String docName;
    private final int amountRaters;

    public DeferredFleissKappaEvaluation(List<Long> docIds, Map<String, Long> codeNamesAndIds, String docName, int amountRaters, ValidationProject validationProject, User user, Long validationReportId, EvaluationUnit evalUnit) {
	super(validationProject, user, validationReportId, evalUnit, docIds);
	this.codeNamesAndIds = codeNamesAndIds;
	this.docName = docName;
	this.amountRaters = amountRaters;
    }

    @Override
    protected void runAlgorithm() throws Exception {
	//prepare input data
	Logger.getLogger("logger").log(Level.INFO, "Preparing Fleiss Kappa Input Data for  " + docName);
	List<Integer[]> inputArrays = new FleissKappaInputDataGenerator(textDocuments, codeNamesAndIds.values(), evalUnit).generateInputData();

	//run algorithm
	FleissKappa kappa = new FleissKappa();
	List<Double> categoryAgreementResults = new ArrayList<>();
	Logger.getLogger("logger").log(Level.INFO, "Computing Fleiss Kappa...");
	for (Integer[] data : inputArrays) { //looping through this array means looping through the Codes
	    double categoryAgreement = kappa.compute(data, amountRaters);
	    categoryAgreementResults.add(categoryAgreement);
	    //WARNING: this Task creates more than one ValidationResult, we need to create new ones on the fly.
	    //save ReportRow in ValidationResult.
	    Logger.getLogger("logger").log(Level.INFO, "Fleiss Kappa Result: " + categoryAgreement);
	}
	
	double averageDocument = calculateAverage(categoryAgreementResults);
	
	List<String> reportRowCells = new ArrayList<>();
	reportRowCells.add(docName);
	reportRowCells.add(averageDocument+"");
	for(Double agreement : categoryAgreementResults) {
	    reportRowCells.add(agreement+"");
	}

	valResult.setReportRow(new TabularValidationReportRow(reportRowCells).toString());
	mgr.makePersistent(valResult);

    }

    private double calculateAverage(List<Double> categoryAgreementResults) {
	double sum = 0;
	for(Double agreement : categoryAgreementResults) {
	    sum += agreement;
	}
	return sum / categoryAgreementResults.size();
    }

}