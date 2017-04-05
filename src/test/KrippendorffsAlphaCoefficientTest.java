package test;

import com.qdacity.project.metrics.algorithms.KrippendorffsAlphaCoefficient;
import com.qdacity.project.metrics.algorithms.datastructures.ReliabilityData;
import org.junit.Test;

public class KrippendorffsAlphaCoefficientTest {

    @Test
    public void test() {
        ReliabilityData rData = new TestableReliabilityData();
        System.out.println(rData.toString());

        KrippendorffsAlphaCoefficient alpha = new KrippendorffsAlphaCoefficient(rData, 4);

        double computedAlpha = alpha.compute();
        System.out.println("RESULT (nominal): " + computedAlpha);
        System.out.println("SHOULD BE (nominal) 1-(1+2)/9.72 =  0.691");
        assert(computedAlpha == 0.691);
    }

   
}
