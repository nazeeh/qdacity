package com.qdacity.project.metrics.algorithms.datastructures;

/**
 * A basic abstract datasturcture for a reliability data matrix
 *
 */
public abstract class KrippendorffsDataMatrix {

    private final int[][] matrixData;
    protected final static int NO_DATA = 0;
    private int x, y;

    public KrippendorffsDataMatrix(int x, int y) {
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

}
