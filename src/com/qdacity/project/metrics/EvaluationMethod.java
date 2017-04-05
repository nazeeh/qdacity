package com.qdacity.project.metrics;

public enum EvaluationMethod {
    F_MEASURE_PARAGRAPH,
    INTERCODER_AGREEMENT_PARAGRAPH, //Already implemented by Andreas
    THEORETICAL_SATURATION,
    COMPLETENESS_CODING_PARADIGM,
    KRIPPENDORFFS_ALPHA,
    COHENS_CAPPA;

    /**
     * returns an Objekt of this Type matching the given String. If it does not
     * match to any, always F_MEASURE_PARAGRAPH is returned as default.
     *
     * @param evalMethod such as "intercoder-agreement",
     * "intercoder-agreement-paragraph", "theoretical-saturation", "krippendorffs-alpha",
     * "cohens-cappa"
     * @return an EvaluationMethod
     */
    public static EvaluationMethod fromString(String evalMethod) {
        switch (evalMethod) {
            case "f-measure-paragraph":
                return EvaluationMethod.F_MEASURE_PARAGRAPH; //FMeasure Paragraph? TODO
            case "intercoder-agreement-paragraph":
                return EvaluationMethod.INTERCODER_AGREEMENT_PARAGRAPH;
            case "theoretical-saturation":
                return EvaluationMethod.THEORETICAL_SATURATION;
            case "completeness-coding-paradigm":
                return EvaluationMethod.COMPLETENESS_CODING_PARADIGM;
            case "krippendorffs-alpha":
                return EvaluationMethod.KRIPPENDORFFS_ALPHA;
            case "cohens-cappa":
                return EvaluationMethod.COHENS_CAPPA;
            default:
                return EvaluationMethod.F_MEASURE_PARAGRAPH;

        }
    }

}
