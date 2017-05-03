package com.qdacity.project.metrics.algorithms.datastructures.converter;

import com.qdacity.project.metrics.algorithms.datastructures.CoincidenceMatrix;
import com.qdacity.project.metrics.algorithms.datastructures.ReliabilityData;

/**
 * Converts Reliability Data to a Coincidence Matrix using the formulas from
 * https://en.wikipedia.org/wiki/Krippendorff%27s_alpha#Coincidence_matrices
 *
 */
public class ReliabilityDataToCoincidenceMatrixConverter {

    public static CoincidenceMatrix convert(ReliabilityData reliabilityData, int numberOfValuesAvailable) {
        CoincidenceMatrix coincidenceMatrix = new CoincidenceMatrix(numberOfValuesAvailable);
        for (int v = 1; v <= numberOfValuesAvailable; v++) {
            for (int v2 = 1; v2 <= numberOfValuesAvailable; v2++) {
                int resultValue = 0;
                for (int unit = 1; unit <= reliabilityData.getAmountUnits(); unit++) {
                    int tmpValue = 0;
                    for (int coder = 1; coder <= reliabilityData.getAmountCoder(); coder++) {
                        for (int coder2 = 1; coder2 <= reliabilityData.getAmountCoder(); coder2++) {
                            if (coder != coder2) {
                                tmpValue += boolToInt(reliabilityData.get(unit, coder) == v) * boolToInt(reliabilityData.get(unit, coder2) == v2);
                            }
                        }
                    }
                    int divisor = reliabilityData.getNumberOfItemsInUnit(unit) - 1;
                    if (divisor != 0) {
                        tmpValue /= divisor;
                    } else {
                        //equals NOT PAIRABLE
                        tmpValue = 0;
                    }
                    resultValue += tmpValue;
                }
                coincidenceMatrix.set(v, v2, resultValue);
            }
        }
        return coincidenceMatrix;
    }

    private static int boolToInt(boolean expression) {
        return expression ? 1 : 0;
    }

}
