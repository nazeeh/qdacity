package com.qdacity.project.metrics.algorithms.datastructures;
import com.qdacity.project.metrics.algorithms.TestableCoincidenceMatrix;
import com.qdacity.project.metrics.algorithms.TestableReliabilityData;
import com.qdacity.project.metrics.algorithms.datastructures.CoincidenceMatrix;
import com.qdacity.project.metrics.algorithms.datastructures.converter.ReliabilityDataToCoincidenceMatrixConverter;
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
