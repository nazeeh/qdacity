package com.qdacity.project.metrics.algorithms;

import com.qdacity.project.metrics.algorithms.datastructures.FleissKappaResult;

/**
 * Implementation of Fleiss' Kappa. Mathematical Details see:
 * https://en.wikipedia.org/wiki/Fleiss%27_kappa#Worked_example
 *
 */
public class FleissKappa {

    /**
     * Fleiss' kappa is a statistical measure for assessing the reliability of
     * agreement between a fixed number of raters when assigning CATEGORICAL
     * ratings to a number of items or classifying items. As it is categorical,
     * but we can have multiple codes per unit in QDAcity you have to calculate
     * this Kappa per every code!
     *
     * @param data [unit] = x = numberOfRaters who applied the code here (which
     * means there are numRaters-x who did not apply the code there)
     * @param numRaters how many raters are there in total
     * @return
     */
    public FleissKappaResult compute(int[] data, int numRaters) {
	assert (numRaters > 1);
	assert (data.length > 0);
	FleissKappaResult result = new FleissKappaResult();

	double[] agreementOfCodePerUnits = calculateAgreementOfCodePerUnits(data, numRaters);
	result.setAgreementOfCategoryPerUnits(agreementOfCodePerUnits);
	
	double totalCategoryAgreement = calculateTotalCategoryAgreement(data, numRaters);
	result.setTotalCategoryAgreement(totalCategoryAgreement);

	return result;
    }

    private double calculateTotalCategoryAgreement(int[] data, int numRaters) {
	int sumRatings = 0;
	for(int i = 0; i<data.length; i++) {
	    sumRatings += data[i];
	}
	double totalCategoryAgreement = sumRatings / (numRaters * data.length);
	return totalCategoryAgreement;
    }

    private double[] calculateAgreementOfCodePerUnits(int[] data, int numRaters) {
	double[] agreementOfCodePerUnits = new double[data.length];
	for (int i = 0; i < data.length; i++) {
	    assert (data[i] <= numRaters); //Otherwise there is a logical problem in the input data.
	    int ratingsForThisCode = data[i];
	    int ratingsNotForThisCode = numRaters - data[i];
	    int ratingsForThisCodeSquared = ratingsForThisCode * ratingsForThisCode;
	    int ratingsNotForThisCodeSquared = ratingsNotForThisCode * ratingsNotForThisCode;

	    agreementOfCodePerUnits[i] = 1 / (numRaters * (numRaters - 1)) * (ratingsForThisCodeSquared + ratingsNotForThisCodeSquared - numRaters);
	}
	return agreementOfCodePerUnits;
    }
}
