package com.qdacity.project.metrics.algorithms.datastructures;

/**
 * Encapsulates the result of the FleissKappa
 *
 */
public class FleissKappaResult {

    private double[] agreementOfCategoryPerUnits;
    private double totalCategoryAgreement;

    public double[] getAgreementOfCategoryPerUnits() {
	return agreementOfCategoryPerUnits;
    }

    public void setAgreementOfCategoryPerUnits(double[] agreementOfCategoryPerUnits) {
	this.agreementOfCategoryPerUnits = agreementOfCategoryPerUnits;
    }

    public double getTotalCategoryAgreement() {
	return totalCategoryAgreement;
    }

    public void setTotalCategoryAgreement(double totalCategoryAgreement) {
	this.totalCategoryAgreement = totalCategoryAgreement;
    }
    
    
}
