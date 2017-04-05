package com.qdacity.project.metrics.algorithms.datastructures;

/**
 *
 *
 */
public class CohensKappaInputMatrix extends RatersDataMatrix {

    public CohensKappaInputMatrix(int categories) {
        super(categories, categories);
    }

    public int sumAll() {
        int sum = 0;
        for (int xIdx = 1; xIdx <= getX(); xIdx++) {
            for (int yIdx = 1; yIdx <= getY(); yIdx++) {
                sum += get(xIdx, yIdx);
            }
        }
        return sum;
    }

}
