package com.qdacity.project.metrics.algorithms;

import com.qdacity.project.metrics.algorithms.datastructures.CoincidenceMatrix;
import com.qdacity.project.metrics.algorithms.datastructures.ReliabilityData;
import com.qdacity.project.metrics.algorithms.datastructures.converter.ReliabilityDataToCoincidenceMatrixConverter;
import com.qdacity.project.metrics.algorithms.functions.DifferenceFunction;
import com.qdacity.project.metrics.algorithms.functions.PermutationFunction;

/**
 * An implementation for the Krippendorff's Alpha Coefficient TODO Using
 * variable names as given in original formulas see, e.g.
 * https://en.wikipedia.org/wiki/Krippendorff%27s_alpha
 */
public class KrippendorffsAlphaCoefficient {

    private final int n; //the total number of pairable elements
    private final DifferenceFunction diffFunction;
    private final int R; //possible responses an observer can give.
    private final CoincidenceMatrix cMatrix;
    private final ReliabilityData reliabilityData;

    public KrippendorffsAlphaCoefficient(DifferenceFunction diffFunction, ReliabilityData reliabilityData, int numberOfAvailableCodes) {
        this.diffFunction = diffFunction;
        this.reliabilityData = reliabilityData;
        this.R = numberOfAvailableCodes;
        this.cMatrix = ReliabilityDataToCoincidenceMatrixConverter.convert(reliabilityData, numberOfAvailableCodes);
        this.n = cMatrix.getTotalPairableElements();
    }

    /**
     * Computes Krippendorff's Alpha TODO
     *
     * @return the result alpha for the given reliabilityData
     */
    public double compute() {
        // Formulas see e.g: https://en.wikipedia.org/wiki/Krippendorff%27s_alpha
        // alpha = 1 - ( D_o / D_e )
        return 1.0 - (computeObservedDisagreement() / computeDisagreementExpectedByChance());
    }

    private double computeObservedDisagreement() {
        double sumsOverDiffFunctionAndPermutation = 0;
        for (int c = 1; c <= R; c++) {
            for (int k = 1; k <= R; k++) {
                double sumPermutation = 0;
                for (int u = 1; u <= reliabilityData.getAmountUnits(); u++) {
                    int m_u = reliabilityData.getNumberOfItemsInUnit(u);
                    if (m_u != 0 && c != k) {
                        sumPermutation
                                += (double) m_u
                                * (double) cMatrix.get(c, k)
                                / PermutationFunction.compute(m_u, 2);
                    }
                }
                sumsOverDiffFunctionAndPermutation += (diffFunction.compute(c, k) * sumPermutation);
            }
        }
        return 1.0 / n * sumsOverDiffFunctionAndPermutation;

    }

    private double computeDisagreementExpectedByChance() {
        double diffFunctionResults = 0;
        for (int c = 1; c <= R; c++) {
            for (int k = 1; k <= R; k++) {
                diffFunctionResults += diffFunction.compute(c, k) * pairsOf(c, k);
            }
        }
        return 1.0 / PermutationFunction.compute(n, 2) * diffFunctionResults;
    }

    private double pairsOf(int c, int k) {
        if (c != k) {
            return cMatrix.getFrequencyOfValue(c) * cMatrix.getFrequencyOfValue(k);
        } else {
            return cMatrix.getFrequencyOfValue(c) * (cMatrix.getFrequencyOfValue(c) - 1);
        }
    }

}
