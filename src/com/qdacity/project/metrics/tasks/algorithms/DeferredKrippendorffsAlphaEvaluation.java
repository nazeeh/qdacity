package com.qdacity.project.metrics.tasks.algorithms;

import com.google.api.server.spi.auth.common.User;
import com.qdacity.project.ValidationProject;
import com.qdacity.project.metrics.EvaluationUnit;
import com.qdacity.project.metrics.TabularValidationReportRow;
import com.qdacity.project.metrics.algorithms.KrippendorffsAlphaCoefficient;
import com.qdacity.project.metrics.algorithms.datastructures.ReliabilityData;
import com.qdacity.project.metrics.algorithms.datastructures.converter.ReliabilityDataGenerator;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

public class DeferredKrippendorffsAlphaEvaluation extends DeferredAlgorithmEvaluation {

    private final List<String> row;
    private final Collection<Long> codeIds;
    

    public DeferredKrippendorffsAlphaEvaluation(ValidationProject validationProject, User user, Long validationReportId, String documentTitle, EvaluationUnit evalUnit, ArrayList<Long> codeIds, ArrayList<Long> textDocumentIds) {
	super(validationProject, user, validationReportId, evalUnit, textDocumentIds);
	this.codeIds = codeIds;
	row = new ArrayList<>();
	row.add(documentTitle);
    }

    @Override
    protected void runAlgorithm() throws Exception {

	List<ReliabilityData> rData = new ReliabilityDataGenerator(textDocuments, codeIds, evalUnit).generate();
	Logger.getLogger("logger").log(Level.INFO, "Calculation of Kripp's Alpha");
	for (ReliabilityData reliabilityData : rData) {
	    KrippendorffsAlphaCoefficient kac = new KrippendorffsAlphaCoefficient(reliabilityData, 2); //We are only checking one code at a time. So it is either set or not set.
	    double result = kac.compute();
	    row.add(result + "");
	    Logger.getLogger("logger").log(Level.INFO, "Kripp's Alpha Result: " + result + " adding to ValidationResult");
	}
	valResult.setReportRow(new TabularValidationReportRow(row).toString());

    }



}
