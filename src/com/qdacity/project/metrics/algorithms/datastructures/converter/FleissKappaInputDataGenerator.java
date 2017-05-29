package com.qdacity.project.metrics.algorithms.datastructures.converter;

import com.qdacity.project.data.TextDocument;
import com.qdacity.project.metrics.EvaluationUnit;
import java.util.Collection;
import java.util.List;
import java.util.Map;

public class FleissKappaInputDataGenerator {

    private final List<TextDocument> textDocuments;
    private final Collection<Long> codeIds;
    private final EvaluationUnit evalUnit;
    

    /**
     * 
     * @param textDocs needs to be the same document, but from different raters.
     * @param codeIds
     * @param evalUnit
     */
    public FleissKappaInputDataGenerator(List<TextDocument> textDocs, Collection<Long> codeIds, EvaluationUnit evalUnit) {
	this.textDocuments = textDocs;
	this.codeIds = codeIds;
	this.evalUnit = evalUnit;
    }

    public Map<Long, Integer[]> generateInputData() {
	//TODO
	return null;
    }
}
