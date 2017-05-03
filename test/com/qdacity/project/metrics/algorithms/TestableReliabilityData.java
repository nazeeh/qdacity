package com.qdacity.project.metrics.algorithms;
import com.qdacity.project.metrics.algorithms.datastructures.ReliabilityData;

public class TestableReliabilityData extends ReliabilityData {
    
    public TestableReliabilityData() {
        // from https://en.wikipedia.org/wiki/Krippendorff%27s_alpha#A_computational_example
        super(15, 3);
        //CODER A
        set(6,1,3);
        set(7,1,4);
        set(8,1,1);
        set(9,1,2);
        set(10,1,1);
        set(11,1,1);
        set(12,1,3);
        set(13,1,3);
        set(15,1,3);
        //CODER B
        set(1,2,1);
        set(3,2,2);
        set(4,2,1);
        set(5,2,3);
        set(6,2,3);
        set(7,2,4);
        set(8,2,3);
       //CODER C
        set(3,3,2);
        set(4,3,1);
        set(5,3,3);
        set(6,3,4);
        set(7,3,4);
        set(9,3,2);
        set(10,3,1);
        set(11,3,1);
        set(12,3,3);
        set(13,3,3);
        set(15,3,4);
       
    }
    
}
