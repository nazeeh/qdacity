package com.qdacity.project.metrics;

public enum EvaluationMethod {
    F_MEASURE,
    KRIPPENDORFFS_ALPHA,
    COHENS_CAPPA;

    /**
     * returns an Objekt of this Type matching the given String. If it does not
     * match to any, always F_MEASURE_PARAGRAPH is returned as default.
     *
     * @param evalMethod such as "f-measure", "krippendorffs-alpha",
     * "cohens-cappa"
     * @return an EvaluationMethod
     */
    public static EvaluationMethod fromString(String evalMethod) {
        switch (evalMethod) {
            case "f-measure":
                return EvaluationMethod.F_MEASURE;
            case "krippendorffs-alpha":
                return EvaluationMethod.KRIPPENDORFFS_ALPHA;
            case "cohens-cappa":
                return EvaluationMethod.COHENS_CAPPA;
            default:
                return EvaluationMethod.F_MEASURE;

        }
    }

}
