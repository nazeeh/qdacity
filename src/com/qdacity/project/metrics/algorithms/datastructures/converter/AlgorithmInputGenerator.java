package com.qdacity.project.metrics.algorithms.datastructures.converter;

import com.qdacity.project.data.TextDocument;
import com.qdacity.project.metrics.EvaluationUnit;
import java.util.Collection;
import java.util.List;

public abstract class AlgorithmInputGenerator {

    protected final List<TextDocument> sameDocumentsFromDifferentRaters;
    protected final Collection<Long> codeIds;
    protected final EvaluationUnit evalUnit;

    public AlgorithmInputGenerator(List<TextDocument> sameDocumentsFromDifferentRaters, Collection<Long> codeIds, EvaluationUnit evalUnit) {
	this.sameDocumentsFromDifferentRaters = sameDocumentsFromDifferentRaters;
	this.codeIds = codeIds;
	this.evalUnit = evalUnit;
    }


}
