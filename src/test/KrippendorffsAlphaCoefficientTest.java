package test;

import com.qdacity.project.metrics.algorithms.KrippendorffsAlphaCoefficient;
import com.qdacity.project.metrics.algorithms.datastructures.KrippendorffsDataMatrix;
import com.qdacity.project.metrics.algorithms.datastructures.ReliabilityData;
import com.qdacity.project.metrics.algorithms.functions.DifferenceFunctionNominal;

public class KrippendorffsAlphaCoefficientTest {

    public static void main(String[] args) {
        ReliabilityData rData = new TestableReliabilityData();
        printMatrix(rData);

        KrippendorffsAlphaCoefficient alpha = new KrippendorffsAlphaCoefficient(new DifferenceFunctionNominal(), rData, 4);

        System.out.println("RESULT (nominal): " + alpha.compute());
        System.out.println("SHOULD BE (nominal) 0.691");
    }

    public static void printMatrix(KrippendorffsDataMatrix matrix) {
        for (int y = 1; y <= matrix.getY(); y++) {
            for (int x = 1; x <= matrix.getX(); x++) {
                System.out.print("[" + y + "|" + x + "]");
                int value = matrix.get(x, y);
                System.out.print((value > 0 ? value : "*") + "\t");
            }
            System.out.println();
        }
    }
}
