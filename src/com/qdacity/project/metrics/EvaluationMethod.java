package com.qdacity.project.metrics;

public enum EvaluationMethod {
    F_MEASURE,
    KRIPPENDORFFS_ALPHA,
    FLEISS_KAPPA;

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
            case "f-measure":
                return EvaluationMethod.F_MEASURE;
            case "krippendorffs-alpha":
                return EvaluationMethod.KRIPPENDORFFS_ALPHA;
            case "fleiss-cappa":
                return EvaluationMethod.FLEISS_KAPPA;
            default:
                return EvaluationMethod.F_MEASURE;

        }
    }

}
