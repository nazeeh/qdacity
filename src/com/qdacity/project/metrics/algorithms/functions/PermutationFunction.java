package com.qdacity.project.metrics.algorithms.functions;

/**
 * Implementation of a permutation funcion
 */
public class PermutationFunction {
    
    /**
     * implements the permutation function using the formula:
     * P(n,r) = n! / (n-r)!
     * @param n
     * @param r
     * @return 
     */
    public static double compute(int n, int r) {
        assert(n>-1);
        assert(r>-1);
        return FactorialFunction.compute(n) / FactorialFunction.compute(n-r);
    }
    
}
