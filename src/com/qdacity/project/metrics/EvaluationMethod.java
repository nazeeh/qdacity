package com.qdacity.project.metrics;

public enum EvaluationMethod {
    F_MEASURE,
    KRIPPENDORFFS_ALPHA,
    FLEISS_KAPPA;

    private static final String FMEASURESTRING = "f-measure";
    private static final String KRIPPSALPHASTRING = "krippendorffs-alpha";
    private static final String FLEISSKAPPASTRING = "fleiss-kappa";

    /**
     * returns an Objekt of this Type matching the given String. If it does not
     * match to any, always F_MEASURE is returned as default.
     *
     * @param evalMethod such as "f-measure", "krippendorffs-alpha",
     * "fleiss-cappa"
     * @return an EvaluationMethod
     */
    public static EvaluationMethod fromString(String evalMethod) {
	switch (evalMethod) {
	    case FMEASURESTRING:
		return EvaluationMethod.F_MEASURE;
	    case KRIPPSALPHASTRING:
		return EvaluationMethod.KRIPPENDORFFS_ALPHA;
	    case FLEISSKAPPASTRING:
		return EvaluationMethod.FLEISS_KAPPA;
	    default:
		return EvaluationMethod.F_MEASURE;

	}
    }

    public String toString() {
	switch (this) {
	    case F_MEASURE:
		return FMEASURESTRING;
	    case KRIPPENDORFFS_ALPHA:
		return KRIPPSALPHASTRING;
	    case FLEISS_KAPPA:
		return FLEISSKAPPASTRING;
	    default:
		return "UNKNOWN";
	}
    }

}
