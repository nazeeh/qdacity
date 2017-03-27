package com.qdacity.project.metrics.algorithms.functions;

/**
 * A mathematical factorial function.
 */
public class FactorialFunction {
    
    
    //TODO ich könnte hier optimieren mit einem array, das die factorials von 0- z.b. 10 vorhält.
    // dann muss es aber rekursiv sein!
    public final static int[] faculty = {
        1,
        1,
        2,
        6,
        24,
        120,
        720,
        5040,
        40320,
        362880,
        3628880 //TODO
    };

    /**
     * computes n!
     * Hint: this implementation uses no recursion.
     * @param n the number for computing n!
     * @return n! (factorial)
     */
    public static int compute(int n) {
        assert(n>-1);
        int factorial = 1;
        for (int i = 1; i <= n; i++) {
            factorial *= i;
        }
        return factorial;
    }

}
