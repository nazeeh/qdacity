package com.qdacity.project.metrics.tasks.algorithms;

import com.google.appengine.api.users.User;
import com.qdacity.project.ValidationProject;
import com.qdacity.project.metrics.DocumentResult;
import com.qdacity.project.metrics.ParagraphAgreement;
import com.qdacity.project.metrics.algorithms.KrippendorffsAlphaCoefficient;
import com.qdacity.project.metrics.algorithms.datastructures.ReliabilityData;
import java.util.logging.Level;
import java.util.logging.Logger;

public class DeferredKrippendorffsAlphaEvaluation extends DeferredAlgorithmEvaluation {

 	private final ReliabilityData rData;

    public DeferredKrippendorffsAlphaEvaluation(ReliabilityData rData, ValidationProject validationProject, User user, Long validationReportId) {
	super(validationProject, user, validationReportId);
	this.rData = rData;
    }

    @Override
    protected void runAlgorithm() throws Exception {
	Logger.getLogger("logger").log(Level.INFO, "Calculation of Kripp's Alpha");
	KrippendorffsAlphaCoefficient kac = new KrippendorffsAlphaCoefficient(rData, 2); //We are only checking one code at a time. So it is either set or not set.
	double result = kac.compute();
	DocumentResult docResult = new DocumentResult();
	//docResult.setDocumentID(validationReportId);
	docResult.setDocumentName("TEST KRIPP'ALPHA DOC-NAME");
	ParagraphAgreement pAgreement  = new ParagraphAgreement();
	pAgreement.setFMeasure(result); //TODO just for testing
	pAgreement.setPrecision(result); //TODO just for testing
	pAgreement.setRecall(result); //TODO just for testing
	pAgreement.setfMeasure(result); //TODO just for testing
	docResult.setParagraphAgreement(pAgreement); //TODO nur Testweise!
	
	Logger.getLogger("logger").log(Level.INFO, "Kripp's Alpha Result: "+result+" adding to Validaiton Result.");
	valResult.addDocumentResult(docResult);
    }

}
