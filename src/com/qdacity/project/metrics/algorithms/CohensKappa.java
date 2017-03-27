package com.qdacity.project.metrics.algorithms;

/**
 * Implementation of Cohens Kappa
 * details: https://en.wikipedia.org/wiki/Cohen's_kappa
 */
public class CohensKappa { //TODO introduce a super class also for krippendorffs alpha
    
    /**
     * TODO
     * Note that Cohen's kappa measures agreement between two raters only
     * @return agreement between two raters
     */
    public double compute() {
        return 1-(1-relativeObservedAgreementAmongRaters()) / (1-hypotheticalProbabilityOfChanceAgreement());
    }

    private int relativeObservedAgreementAmongRaters() {
        //TODO
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    private int hypotheticalProbabilityOfChanceAgreement() {
        //TODO
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }
}
