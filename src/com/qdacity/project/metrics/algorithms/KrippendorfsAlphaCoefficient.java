package com.qdacity.project.metrics.algorithms;

import com.qdacity.project.metrics.algorithms.functions.DifferenceFunction;
import com.qdacity.project.metrics.algorithms.functions.PermutationFunction;

/**
 * An implementation for the Krippendorff's Alpha Coefficient TODO Using
 * variable names as given in original formulas see, e.g.
 * https://en.wikipedia.org/wiki/Krippendorff%27s_alpha
 */
public class KrippendorfsAlphaCoefficient {

    private int n; //the total number of pairable elements
    private int m_u; //the number of items in a unit
    private DifferenceFunction diffFunction;
    private int R; //possible responses an observer can give.
    //TODO

    /**
     * Computes Krippendorff's Alpha TODO
     *
     * @param reliabilityData the data we want to compute the alpha on.
     * @return the result alpha for the given reliabilityData
     */
    public double compute(ReliabilityData reliabilityData) {
        // Formulas see Krippendorff's Paper or: https://en.wikipedia.org/wiki/Krippendorff%27s_alpha
        // alpha = 1 - ( D_o / D_e )
        return 1 - (computeObservedDisagreement() / computeDisagreementExpectedByChance());
    }

    private double computeObservedDisagreement() {
        double inversedPermutationAcummulated = 0;
        double diffFunctionResults = 0;
        for (int c = 0; c < R; c++) {
            for (int k = 0; k < R; k++) {
                diffFunctionResults += diffFunction.compute(c, k);
                // for(int u = 0; u ) ??? TODO

            }
        }
        return 1 / n * diffFunctionResults * inversedPermutationAcummulated;

    }

    private double computeDisagreementExpectedByChance() {
        double diffFunctionResults = 0;
        for (int c = 0; c < R; c++) {
            for (int k = 0; k < R; k++) {
                diffFunctionResults += diffFunction.compute(c, k) * pairsOf(c, k);

            }
        }
        return 1 / PermutationFunction.compute(n, 2) * diffFunctionResults;
    }

    private int pairsOf(int c, int k) {
        if (c != k) {
            //TODO ???
        } else {
            //TODO ???
        }
        return 1;
    }

}
