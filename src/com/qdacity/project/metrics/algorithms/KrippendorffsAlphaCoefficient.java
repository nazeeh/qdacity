package com.qdacity.project.metrics.algorithms;

import com.qdacity.project.metrics.algorithms.datastructures.ReliabilityData;
import com.qdacity.project.metrics.algorithms.functions.DifferenceFunction;
import com.qdacity.project.metrics.algorithms.functions.PermutationFunction;

/**
 * An implementation for the Krippendorff's Alpha Coefficient TODO Using
 * variable names as given in original formulas see, e.g.
 * https://en.wikipedia.org/wiki/Krippendorff%27s_alpha
 */
public class KrippendorffsAlphaCoefficient {

    private int n; //the total number of pairable elements
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
        //TODO reliabilityData zu Coincidece Matrix convertieren.
        //n=reliabilityData.getTotalPairableElements();
        // Formulas see Krippendorff's Paper or: https://en.wikipedia.org/wiki/Krippendorff%27s_alpha
        // alpha = 1 - ( D_o / D_e )
        return 1 - (computeObservedDisagreement(reliabilityData) / computeDisagreementExpectedByChance());
    }

    private double computeObservedDisagreement(ReliabilityData reliabilityData) {
        double inversedPermutationAcummulated = 0;
        double diffFunctionResults = 0;
        for (int c = 0; c < R; c++) {
            for (int k = 0; k < R; k++) {
                double sumPermutation = 0;
                for (int u = 0; u < reliabilityData.getAmountUnits(); u++) {
                    int m_u = reliabilityData.getNumberOfItemsInUnit(u);
                    sumPermutation
                            += m_u
                            * reliabilityData.get(c, k)
                            / //should be n_cku number of ( c , k ) {\displaystyle (c,k)} {\displaystyle (c,k)} pairs in unit u {\displaystyle u} u  TODO???
                            PermutationFunction.compute(m_u, 2);
                }
                diffFunctionResults += (diffFunction.compute(c, k) * sumPermutation);
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
