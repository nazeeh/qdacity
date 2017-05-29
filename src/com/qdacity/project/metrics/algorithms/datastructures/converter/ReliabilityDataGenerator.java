package com.qdacity.project.metrics.algorithms.datastructures.converter;

import com.qdacity.project.data.TextDocument;
import com.qdacity.project.metrics.EvaluationUnit;
import com.qdacity.project.metrics.algorithms.datastructures.ReliabilityData;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public class ReliabilityDataGenerator extends AlgorithmInputGenerator {

    public ReliabilityDataGenerator(List<TextDocument> textDocuments, Collection<Long> codeIds, EvaluationUnit evalUnit) {
	super(textDocuments, codeIds, evalUnit);
    }

    /**
     * Creates a ReliabilityData with the same document in the same revision,
     * but from differen raters per Code
     *
     * @return ReliabilityData derived from the given Documents
     */
    public List<ReliabilityData> generate() {
	int raters = sameDocumentsFromDifferentRaters.size();
	List<List<String>> ratings = new ArrayList<>();
	List<ReliabilityData> rDatas = new ArrayList<>();

	for (TextDocument document : sameDocumentsFromDifferentRaters) {
	    ratings.add(split(document));
	}

	for (long codeId : codeIds) {
	    ReliabilityData rData = new ReliabilityData(ratings.get(0).size(), raters); //TODO units nicht unbedingt gleich lang!! split nicht eindeutig!
	    for (int coder = 1; coder <= raters; coder++) {
		for (int unit = 1; unit <= ratings.get(coder - 1).size(); unit++) {
		    int valueToSet = 1; //1 not set
		    if (ratings.get(coder - 1).get(unit - 1).equals(codeId + "")) {
			//Only set 1 if code we are looking at right now is set.
			valueToSet = 2; //set
		    }
		    rData.set(unit, coder, valueToSet);
		}
	    }
	    rDatas.add(rData);
	}

	return rDatas;
    }
}
