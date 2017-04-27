package com.qdacity.project.metrics.tasks.algorithms;

import com.google.appengine.api.users.User;
import com.qdacity.project.ValidationProject;
import com.qdacity.project.metrics.TabularValidationReport;
import com.qdacity.project.metrics.algorithms.KrippendorffsAlphaCoefficient;
import com.qdacity.project.metrics.algorithms.datastructures.ReliabilityData;
import java.util.logging.Level;
import java.util.logging.Logger;

public class DeferredKrippendorffsAlphaEvaluation extends DeferredAlgorithmEvaluation {

    private final ReliabilityData rData;
    private final TabularValidationReport report;

    public DeferredKrippendorffsAlphaEvaluation(ReliabilityData rData, ValidationProject validationProject, User user, TabularValidationReport tabularValidationReport) {
	super(validationProject, user);
	this.rData = rData;
	report = tabularValidationReport;
    }

    @Override
    protected void runAlgorithm() throws Exception {
	Logger.getLogger("logger").log(Level.INFO, "Calculation of Kripp's Alpha");
	KrippendorffsAlphaCoefficient kac = new KrippendorffsAlphaCoefficient(rData, 2); //We are only checking one code at a time. So it is either set or not set.
	double result = kac.compute();


	Logger.getLogger("logger").log(Level.INFO, "Kripp's Alpha Result: " + result + " adding to TabularValidationResult");
    }

}
