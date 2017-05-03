package com.qdacity.project.metrics.algorithms.datastructures;

/**
 * The CoincidenceMatrix needed for the Krippendorff's Alpha Algorithm
 *
 * @author ms
 */
public class CoincidenceMatrix extends RatersDataMatrix {

    public CoincidenceMatrix(int v) {
        super(v, v);
    }

    /**
     * Hint: this is usually named 'n' in the Krippendorff's Alpha formulas
     *
     * @return the number of total pairable elements in the coincidende matrix
     */
    public int getTotalPairableElements() {
        int pairable = 0;
        for (int xIdx = 1; xIdx <= getX(); xIdx++) {
            for (int yIdx = 1; yIdx <= getY(); yIdx++) {
                pairable += get(xIdx, yIdx);
            }
        }
        return pairable;
    }

    /**
     * The frequency of a value in the matrix
     * @param value the value
     * @return the value's frequency
     */
    public int getFrequencyOfValue(int value) {
        assert(value<=getX());
        assert(value>0);
        int frequency=0;
        for (int v2 = 1; v2 <= getX(); v2++) {
            frequency+=get(v2, value);
        }
        return frequency;
    }

}
