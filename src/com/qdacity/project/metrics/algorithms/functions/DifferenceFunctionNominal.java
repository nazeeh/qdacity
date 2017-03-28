package com.qdacity.project.metrics.algorithms.functions;

/**
 * A difference function for nominal data for the Krippendorff's Alpha Algoritm
 * more: https://en.wikipedia.org/wiki/Krippendorff%27s_alpha#Difference_functions
 */
public class DifferenceFunctionNominal implements DifferenceFunction {

    @Override
    public double compute(int v, int v_dash) {
        if (v == v_dash) {
            return 0.0;
        } else {
            return 1.0;
        }

    }

}
