package com.qdacity.project.metrics.algorithms;

import java.util.logging.Level;
import java.util.logging.Logger;

import com.qdacity.project.metrics.algorithms.datastructures.CoincidenceMatrix;
import com.qdacity.project.metrics.algorithms.datastructures.ReliabilityData;
import com.qdacity.project.metrics.algorithms.datastructures.converter.ReliabilityDataToCoincidenceMatrixConverter;

/**
 * An implementation for the Krippendorff's Alpha Coefficient using
 * variable names as given in original formulas see, e.g.
 * <a>https://en.wikipedia.org/wiki/Krippendorff%27s_alpha</a>
 */
public class KrippendorffsAlphaCoefficient {

    private final int n; //the total number of pairable elements
    private final int R; //possible responses an observer can give.
    private final CoincidenceMatrix cMatrix;

    /**
     * Computes the Krippendorff's Alpha for nominal ratings
     * @param reliabilityData The data which contains the units and their ratings.
     * @param numberOfAvailableCodes How many codes a rater can use.
     */
    public KrippendorffsAlphaCoefficient(ReliabilityData reliabilityData, int numberOfAvailableCodes) {
        this.R = numberOfAvailableCodes;
	assert(reliabilityData.getAmountCoder()>1);
        this.cMatrix = ReliabilityDataToCoincidenceMatrixConverter.convert(reliabilityData, numberOfAvailableCodes);
        this.n = cMatrix.getTotalPairableElements();
        assert (this.n > 0);
    }

    /**
     * Computes Krippendorff's Alpha with the set parameters in the constructor
     * Uses the formulas as described in <a>https://en.wikipedia.org/wiki/Krippendorff%27s_alpha</a>
     * WARNING: Does not support multiple codings per unit by one user. Please split your input in multiple reliability Data in that case an run this algorithm several times for each code.
     * @return the result alpha for the given reliabilityData
     */
    public double compute() {
        // Formulas see e.g: https://en.wikipedia.org/wiki/Krippendorff%27s_alpha
        // alpha = 1 - ( D_o / D_e )
    	Logger.getLogger("logger").log(Level.INFO, "cMatrix: "+cMatrix.toString());
        double observedDisagreement = computeObservedDisagreement();
        double disagreementExpectedByChance = computeDisagreementExpectedByChance();
        Logger.getLogger("logger").log(Level.INFO, "Kripp's Alpha Calculation: 1-" + observedDisagreement + "/" + disagreementExpectedByChance);
	if(disagreementExpectedByChance == 0) {
	    return 1.0; //if there is no expected disagreement then there was only one rater, so alpha must be 1.
	}
	double result = 1.0 - (observedDisagreement / disagreementExpectedByChance);
	if(result < 0) {
	    Logger.getLogger("logger").log(Level.INFO, "Result is below zero! "+result+ ". Alpha < 0 when disagreements are systematic and exceed what can be expected by chance. ");
	}
	return result;
    }

    private double computeObservedDisagreement() {
        double sumDisagreement = 0;
        for (int c = 1; c <= R; c++) {
            for (int k = c + 1; k <= R; k++) {
                sumDisagreement += cMatrix.get(c, k) * nominalDifferenceFunction(c, k);
            }
        }
        return sumDisagreement;

    }

    private double computeDisagreementExpectedByChance() {
        double[] sumRatings = new double[R + 1];
        for (int c = 1; c <= R; c++) {
            for (int k = 1; k <= R; k++) {
                sumRatings[c] += cMatrix.get(c, k);
            }
        }

        double expDisagreementSum = 0;
        for (int c = 1; c <= R; c++) {
            for (int k = c + 1; k <= R; k++) {
                expDisagreementSum += sumRatings[c] * sumRatings[k] * nominalDifferenceFunction(c, k);
            }
        }
        double result = expDisagreementSum / (cMatrix.getTotalPairableElements() - 1); 
        return result;
    }

    /**
     * A difference function for nominal data. We are only dealing with nominal
     * data (coding IDs), therefore we won't need other difference functions.
     *
     * @param v
     * @param v_dash
     * @return 0.0 if v==v_dash, 1.0 otherwise
     */
    private double nominalDifferenceFunction(int v, int v_dash) {
        if (v == v_dash) {
            return 0.0;
        } else {
            return 1.0;
        }
    }

}
