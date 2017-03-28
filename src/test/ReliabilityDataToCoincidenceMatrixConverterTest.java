package test;


import com.qdacity.project.metrics.algorithms.datastructures.CoincidenceMatrix;
import com.qdacity.project.metrics.algorithms.datastructures.KrippendorffsDataMatrix;
import com.qdacity.project.metrics.algorithms.datastructures.converter.ReliabilityDataToCoincidenceMatrixConverter;

public class ReliabilityDataToCoincidenceMatrixConverterTest {

    public static void main(String[] args) {
        ReliabilityDataToCoincidenceMatrixConverterTest test = new ReliabilityDataToCoincidenceMatrixConverterTest();

        test.test();
    }

    public void test() {
        TestableReliabilityData reliabilityData = new TestableReliabilityData();
        System.out.println("=== RELIABILITY DATA ===");
        printMatrix(reliabilityData);

        CoincidenceMatrix cMatrix = ReliabilityDataToCoincidenceMatrixConverter.convert(reliabilityData, 4);

        System.out.println("=== COINCIDENCE MATRIX ===");
        printMatrix(cMatrix);
        for (int value = 1; value <= cMatrix.getX(); value++) {
            System.out.println("Value "+value+" frequency: " + cMatrix.getFrequencyOfValue(value));
        }
        System.out.println("Total Pairable Elements: " + cMatrix.getTotalPairableElements());

    }

    public void printMatrix(KrippendorffsDataMatrix matrix) {
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
