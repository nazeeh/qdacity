package com.qdacity.project.metrics.tasks.algorithms;

import com.google.appengine.api.users.User;
import com.qdacity.project.ValidationProject;
import com.qdacity.project.data.TextDocument;
import com.qdacity.project.metrics.EvaluationUnit;
import com.qdacity.project.metrics.TabularValidationReportRow;
import com.qdacity.project.metrics.algorithms.FleissKappa;
import com.qdacity.project.metrics.algorithms.datastructures.FleissKappaResult;
import com.qdacity.project.metrics.algorithms.datastructures.converter.FleissKappaInputDataGenerator;
import com.qdacity.project.metrics.algorithms.datastructures.converter.FleissKappaResultConverter;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

public class DeferredFleissKappaEvaluation extends DeferredAlgorithmEvaluation {

    private final List<Long> docIds;
    private final Map<String, Long> codeNamesAndIds;
    private final String docName;
    private final int amountRaters;

    public DeferredFleissKappaEvaluation(List<Long> docIds, Map<String, Long> codeNamesAndIds, String docName, int amountRaters, ValidationProject validationProject, User user, Long validationReportId, EvaluationUnit evalUnit) {
	super(validationProject, user, validationReportId, evalUnit);
	this.docIds = docIds;
	this.codeNamesAndIds = codeNamesAndIds;
	this.docName = docName;
	this.amountRaters = amountRaters;
    }

    @Override
    protected void runAlgorithm() throws Exception {
	//prepare input data
	Logger.getLogger("logger").log(Level.INFO, "Preparing Fleiss Kappa Input Data for  " + docName);
	List<TextDocument> txDocs = collectTextDocumentsfromMemcache(docIds);
	List<Integer[]> inputArrays = new FleissKappaInputDataGenerator(txDocs, codeNamesAndIds.values(), evalUnit).generateInputData();

	//run algorithm
	FleissKappa kappa = new FleissKappa();
	String[] codeNames = (String[]) codeNamesAndIds.keySet().toArray(new String[codeNamesAndIds.keySet().size()]);
	int index = 0;
	Logger.getLogger("logger").log(Level.INFO, "Computing Fleiss Kappa...");
	int validationResults = 1;
	for (Integer[] data : inputArrays) {
	    FleissKappaResult fleissKappaResult = kappa.compute(data, amountRaters);
	    TabularValidationReportRow rowResult = FleissKappaResultConverter.toTabularValidationReportRow(docName, codeNames[index], fleissKappaResult);
	    index++;
	    //WARNING: this Task creates more than one ValidationResult, we need to create new ones on the fly.
	    //save ReportRow in ValidationResult.
	    String resultAsString = rowResult.toString();
	    Logger.getLogger("logger").log(Level.INFO, "Fleiss Kappa Result: " + resultAsString);
	    valResult.setReportRow(resultAsString);
	    mgr.makePersistent(valResult);
	    if (validationResults < data.length-2) { //prevent creating an empty one in the end
		valResult = makeNextValidationResult();
	    }
	    validationResults++;
	}

    }

}
