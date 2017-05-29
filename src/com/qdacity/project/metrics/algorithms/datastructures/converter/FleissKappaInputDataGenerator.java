package com.qdacity.project.metrics.algorithms.datastructures.converter;

import com.qdacity.project.data.TextDocument;
import com.qdacity.project.metrics.EvaluationUnit;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

public class FleissKappaInputDataGenerator extends AlgorithmInputGenerator {

    public FleissKappaInputDataGenerator(List<TextDocument> textDocuments, Collection<Long> codeIds, EvaluationUnit evalUnit) {
	super(textDocuments, codeIds, evalUnit);
    }

    /**
     * Input data for Fleiss' Kappa is an Array containing the number of usages
     * per paragraph of one code.
     *
     * @return List of arrays described above for all the codeIds set in the
     * constructor.
     */
    public List<Integer[]> generateInputData() {
	Map<Long, Integer[]> inputDatas = new HashMap<>();
	List<List<List<String>>> documentUnitCodes = getDocumentUnitCodes();
	for (List<List<String>> singleDocumentUnitCodes : documentUnitCodes) {
	    for (Long codeId : codeIds) {
		Integer[] cleanIntArray= createCleanIntArray(singleDocumentUnitCodes.size());
		inputDatas.put(codeId, cleanIntArray);
		
	    }
	    int unit = 0;
	    for (List<String> singleUnitCodes : singleDocumentUnitCodes) {
		for(String code: singleUnitCodes) {
		    Long codeId = new Long(code);
		    Logger.getLogger("logger").log(Level.INFO, "Counting another "+codeId+" in Unit "+unit);
		    inputDatas.get(codeId)[unit] += 1;
		}
		unit++;
	    }
	}

	return new ArrayList(inputDatas.values());
    }

    /**
     * 
     * @param size
     * @return 0 initialized Integer Array
     */
    private Integer[] createCleanIntArray(int size) {
	Integer [] cleanArray = new Integer[size];
	for(int i = 0; i< size; i++) {
	    cleanArray[i] = 0;
	}
	return cleanArray;
    }
}
