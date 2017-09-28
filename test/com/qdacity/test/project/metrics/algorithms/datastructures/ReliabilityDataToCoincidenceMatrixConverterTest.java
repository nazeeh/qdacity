package com.qdacity.test.project.metrics.algorithms.datastructures;
import com.qdacity.project.metrics.algorithms.datastructures.CoincidenceMatrix;
import com.qdacity.project.metrics.algorithms.datastructures.converter.ReliabilityDataToCoincidenceMatrixConverter;
import com.qdacity.test.project.metrics.algorithms.TestableCoincidenceMatrix;
import com.qdacity.test.project.metrics.algorithms.TestableReliabilityData;

import org.junit.Test;

public class ReliabilityDataToCoincidenceMatrixConverterTest {


    @Test
    public void test() {
        TestableReliabilityData reliabilityData = new TestableReliabilityData();

        CoincidenceMatrix cMatrix = ReliabilityDataToCoincidenceMatrixConverter.convert(reliabilityData, 4);
        CoincidenceMatrix solution = new TestableCoincidenceMatrix();

        assert(cMatrix.equals(solution));
        

    }
}
