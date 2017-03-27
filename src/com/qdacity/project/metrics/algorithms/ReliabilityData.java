package com.qdacity.project.metrics.algorithms;

/**
 * Datastructure for the Reliability Data Matrix, which is the Input for
 * KrippenDorfsAlphaCoefficient
 *
 */
public class ReliabilityData {

    //According to https://en.wikipedia.org/wiki/Krippendorff%27s_alpha#Reliability_data
    private int[][] reliabilityData; //TODO welcher Value bedeutet was? Neue Klasse?
    private final int units, coder;

    public ReliabilityData(int units, int coder) {
        assert (units > 0);
        assert (coder > 0);
        this.units = units;
        this.coder = coder;
        this.reliabilityData = new int[units][coder];
    }

    /**
     * Set a value in the ReliabilityData Matrix
     *
     * @param unit on which unit
     * @param coder by which coder
     * @param value the value
     */
    public void set(int unit, int coder, int value) {
        int unitIdx = unit - 1;
        int coderIdx = coder - 1;
        assert (unitIdx < units);
        assert (coderIdx < coder);
        assert (unitIdx > -1);
        assert (coderIdx > -1);
        this.reliabilityData[unitIdx][coderIdx] = value;
    }

    /**
     * Get a value from the ReliabilityData Matrix
     * @param unit from which unit
     * @param coder by which coder
     * @return the value
     */
    public int get(int unit, int coder) {
        int unitIdx = unit - 1;
        int coderIdx = coder - 1;
        assert (unitIdx < units);
        assert (coderIdx < coder);
        assert (unitIdx > -1);
        assert (coderIdx > -1);
        return this.reliabilityData[unitIdx][coderIdx];
    }
    
    /**
     * 
     * @return the number of Coders in this reliability data
     */
    public int getAmountCoder() {
        return coder;
    }
    
    /**
     * 
     * @return the number of coded units in this reliability data
     */
    public int getAmountUnits(){
        return units;
    }
}
