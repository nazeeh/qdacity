package com.qdacity.project.metrics.algorithms.functions;

/**
 * The interface for a difference function for Krippendorff's Alpha Algorithm
 * more: https://en.wikipedia.org/wiki/Krippendorff%27s_alpha#Difference_functions
 */
public interface DifferenceFunction {
    
    public double compute(int v, int v_dash);
    
}
