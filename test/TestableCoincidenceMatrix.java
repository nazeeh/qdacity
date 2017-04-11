import com.qdacity.project.metrics.algorithms.datastructures.CoincidenceMatrix;

public class TestableCoincidenceMatrix extends CoincidenceMatrix {
    
    public TestableCoincidenceMatrix() {
        super(4);
        set(1,1, 6);
        set(1,3, 1);
        set(2,2, 4);
        set(3,1, 1);
        set(3,3, 7);
        set(3,4, 2);
        set(4,3, 2);
        set(4,4, 3);
    }
    
}
