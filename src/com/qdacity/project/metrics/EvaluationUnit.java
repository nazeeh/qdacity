package com.qdacity.project.metrics;

/**
 * Specifies the unit of coding to be evaluated by the metrics. 
 * TextDocuments will be split into units for evaluation.
 */
public enum EvaluationUnit {
    PARAGRAPH,
    SENTENCE;
    
    private static final String paragraph = "paragraph";
    private static final String sentence = "sentence";
    
    public static EvaluationUnit fromString(String evalUnit) {
	switch(evalUnit) {
	    case paragraph:
		return EvaluationUnit.PARAGRAPH;
	    case sentence:
		return EvaluationUnit.SENTENCE;
	    default:
		return EvaluationUnit.PARAGRAPH;
	}
    }
    
    @Override
    public String toString() {
	if (this.equals(EvaluationUnit.PARAGRAPH)){
	    return paragraph;
	} else {
	    return sentence;
	}
    }
}
