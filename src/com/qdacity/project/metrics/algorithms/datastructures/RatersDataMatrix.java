package com.qdacity.project.metrics.algorithms.datastructures;

import java.io.Serializable;

/**
 * A basic abstract datasturcture for a data matrix containing values from raters
 *
 */
public abstract class RatersDataMatrix implements Serializable {

    private final int[][] matrixData;
    protected final static int NO_DATA = 0;
    private final int x;
    private final int y;

    public RatersDataMatrix(int x, int y) {
        assert (x > 0);
        assert (y > 0);
        this.x = x;
        this.y = y;
        this.matrixData = new int[x][y];
    }

    public int getX() {
        return x;
    }

    public int getY() {
        return y;
    }

    /**
     * Set a value in the ReliabilityData Matrix
     *
     * @param x on which "column" starting from 1
     * @param y on which "row" starting from 1
     * @param value the value
     */
    public void set(int x, int y, int value) {
        int xIdx = x - 1;
        int yIdx = y - 1;
        assert (xIdx < x);
        assert (yIdx < y);
        assert (xIdx > -1);
        assert (yIdx > -1);
        this.matrixData[xIdx][yIdx] = value;
    }

    /**
     * Get a value from the ReliabilityData Matrix
     *
     * @param x from which "column" starting from 1
     * @param y from which "row" starting from 1
     * @return the value
     */
    public int get(int x, int y) {
        int xIdx = x - 1;
        int yIdx = y - 1;
        assert (xIdx < x);
        assert (yIdx < y);
        assert (xIdx > -1);
        assert (yIdx > -1);
        return this.matrixData[xIdx][yIdx];
    }

    @Override
    public boolean equals(Object other) {
        if (other instanceof RatersDataMatrix) {
            RatersDataMatrix otherMatrix = (RatersDataMatrix) other;
            if (otherMatrix.getX() != this.getX() || otherMatrix.getY() != this.getY()) {
                return false;
            }
            for (int x = 1; x <= getX(); x++) {
                for (int y = 1; y <= getY(); y++) {
                    if (otherMatrix.get(x, y) != this.get(x, y)) {
                        return false;
                    }
                }
            }
            return true;
        } else {
            return false;
        }
    }


    @Override
    public String toString() {
        String stringRepresentation = "";
        for (int yIdx = 1; yIdx <= getY(); yIdx++) {
            for (int xIdx = 1; xIdx <= getX(); xIdx++) {
                stringRepresentation += "[" + yIdx + "|" + xIdx + "]";
                int value = get(xIdx, yIdx);
                stringRepresentation += (value > 0 ? value : "*") + "\t";
            }
            stringRepresentation += "\n";
        }
        return stringRepresentation;
    }

}
