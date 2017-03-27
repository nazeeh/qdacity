package com.qdacity.project.metrics.algorithms.datastructures;

/**
 * Datastructure for the Reliability Data Matrix, which is the Input for
 * KrippenDorfsAlphaCoefficient
 *
 */
public class ReliabilityData extends KrippendorffsDataMatrix {

    //According to https://en.wikipedia.org/wiki/Krippendorff%27s_alpha#Reliability_data
    public ReliabilityData(int units, int coder) {
        super(units, coder);
    }

    /**
     *
     * @return the number of Coders in this reliability data
     */
    public int getAmountCoder() {
        return getY();
    }

    /**
     *
     * @return the number of coded units in this reliability data
     */
    public int getAmountUnits() {
        return getX();
    }

    /**
     * Set a value in the ReliabilityData
     *
     * @param unit on which unit starting from 1
     * @param coder by which coder starting from 1
     * @param value the value
     */
    @Override
    public void set(int unit, int coder, int value) {
        super.set(unit, coder, value);
    }

    /**
     * get a value from the ReliabilityData
     *
     * @param unit from which unit starting from 1
     * @param coder by which coder starting from 1
     */
    @Override
    public int get(int unit, int coder) {
        return super.get(unit, coder);
    }

    /**
     * Counts the codes in a unit (only the real codes, ignores NO_DATA)
     * @param u from which unit
     * @return number of items in unit u
     */
    public int getNumberOfItemsInUnit(int u) {
        assert (u > 0);
        assert (u <= getAmountUnits());
        int numberOfItems = 0;
        for (int c = 1; c <= getAmountCoder(); c++) {
            if (get(u, c) != NO_DATA) {
                numberOfItems++;
            }
        }
        return numberOfItems;
    }

}
