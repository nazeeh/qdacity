package com.qdacity.project.metrics.algorithms.datastructures.converter;

import com.qdacity.project.data.TextDocument;
import com.qdacity.project.metrics.EvaluationUnit;
import java.util.Collection;
import java.util.List;
import java.util.Map;

public class FleissKappaInputDataGenerator extends AlgorithmInputGenerator  {

    public FleissKappaInputDataGenerator(List<TextDocument> textDocuments, Collection<Long> codeIds, EvaluationUnit evalUnit) {
	super(textDocuments, codeIds, evalUnit);
    }

    public Map<Long, Integer[]> generateInputData() {
	//TODO
	return null;
    }
}
