package com.qdacity.project.metrics;

/**
 * Specifies the unit of coding to be evaluated by the metrics. 
 * TextDocuments will be split into units for evaluation.
 */
public enum EvaluationUnit {
    PARAGRAPH,
    SENTENCE;
    
    public static EvaluationUnit fromString(String evalUnit) {
	switch(evalUnit) {
	    case "paragraph":
		return EvaluationUnit.PARAGRAPH;
	    case "sentence":
		return EvaluationUnit.SENTENCE;
	    default:
		return EvaluationUnit.PARAGRAPH;
	}
    }
}
