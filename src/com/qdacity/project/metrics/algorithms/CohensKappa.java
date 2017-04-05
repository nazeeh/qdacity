package com.qdacity.project.metrics.algorithms;

import com.qdacity.project.metrics.algorithms.datastructures.CohensKappaInputMatrix;

/**
 * Implementation of Cohens Kappa details:
 * https://en.wikipedia.org/wiki/Cohen's_kappa
 */
public class CohensKappa { //TODO introduce a super class also for krippendorffs alpha

    private int N; //number of items
    private int categories;
    CohensKappaInputMatrix matrix;

    public CohensKappa(CohensKappaInputMatrix matrix) {
        this.matrix = matrix;
    }

    /**
     * TODO Note that Cohen's kappa measures agreement between two raters only
     *
     * @return agreement between two raters
     */
    public double compute() {
        return 1 - (1 - relativeObservedAgreementAmongRaters()) / (1 - hypotheticalProbabilityOfChanceAgreement());
    }

    private double relativeObservedAgreementAmongRaters() {
        //From https://en.wikipedia.org/wiki/Evaluation_of_binary_classifiers (Accuracy)
        int sumTruePositive = sumTruePositives();
        int sumTrueNegative = sumTrueNegatives();
        int sumAll = matrix.sumAll();
        return (sumTruePositive + sumTrueNegative) / sumAll;
    }

    private double hypotheticalProbabilityOfChanceAgreement() {
        double sum = 0;
        for (int k = 0; k < categories; k++) {
            sum += 1; //TODO
        }
        return (1.0 / (N * N)) * sum;
    }

    private int sumTruePositives() {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    private int sumTrueNegatives() {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }
}
