package com.qdacity.project.metrics.tasks.algorithms;

import com.google.appengine.api.users.User;
import com.qdacity.project.ValidationProject;
import com.qdacity.project.data.TextDocument;
import com.qdacity.project.metrics.EvaluationUnit;
import com.qdacity.project.metrics.TabularValidationReportRow;
import com.qdacity.project.metrics.algorithms.FleissKappa;
import com.qdacity.project.metrics.algorithms.datastructures.FleissKappaResult;
import com.qdacity.project.metrics.algorithms.datastructures.converter.FleissKappaInputDataConverter;
import com.qdacity.project.metrics.algorithms.datastructures.converter.FleissKappaResultConverter;
import java.util.List;
import java.util.Map;

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
	List<TextDocument> txDocs = collectTextDocumentsfromMemcache(docIds);
	Map<Long, Integer[]> inputMap = new FleissKappaInputDataConverter(txDocs, codeNamesAndIds.values(), evalUnit).generateInputData();

	//run algorithm
	FleissKappa kappa = new FleissKappa();
	String[] codeNames = (String[]) codeNamesAndIds.keySet().toArray();
	int index = 0;
	for (Integer[] data : inputMap.values()) {
	    FleissKappaResult fleissKappaResult = kappa.compute(data, amountRaters);
	    TabularValidationReportRow rowResult = FleissKappaResultConverter.toTabularValidationReportRow(docName, codeNames[index], fleissKappaResult);
	    index++;
	    //WARNING: this Task creates more than one ValidationResult, we need to create new ones on the fly.
	    //save ReportRow in ValidationResult.
	    valResult.setReportRow(rowResult.toString());
	    mgr.makePersistent(valResult);
	    valResult = makeNextValidationResult();
	} 
	    
    }

}
