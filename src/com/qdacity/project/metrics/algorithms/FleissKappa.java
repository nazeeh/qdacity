package com.qdacity.project.metrics.algorithms;


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
    public double compute(Integer[] data, int numRaters) {
	assert (numRaters > 1);
	assert (data.length > 0);

	double totalCategoryAgreement = calculateTotalCategoryAgreement(data, numRaters);

	return totalCategoryAgreement;
    }

    private double calculateTotalCategoryAgreement(Integer[] data, double numRaters) {
	double sumRatings = 0;
	double dataLength = data.length;
	for (int i = 0; i < dataLength; i++) {
	    sumRatings += data[i];
	}
	double totalCategoryAgreement = sumRatings / (numRaters * dataLength);
	return totalCategoryAgreement;
    }
}
