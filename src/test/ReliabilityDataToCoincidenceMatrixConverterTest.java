package test;

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
