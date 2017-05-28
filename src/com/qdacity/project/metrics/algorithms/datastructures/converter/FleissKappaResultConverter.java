package com.qdacity.project.metrics.algorithms.datastructures.converter;

import com.qdacity.project.metrics.TabularValidationReportRow;
import com.qdacity.project.metrics.algorithms.datastructures.FleissKappaResult;
import java.util.ArrayList;
import java.util.List;

public class FleissKappaResultConverter {
    
    public static TabularValidationReportRow toTabularValidationReportRow(String documentName, String codeName, FleissKappaResult result) {
	List<String> cells = new ArrayList<>();
	
	cells.add(documentName+": "+codeName);
	cells.add(result.getTotalCategoryAgreement()+"");
	for(double perUnit : result.getAgreementOfCategoryPerUnits()) {
	    cells.add(perUnit+"");
	}
	
	return new TabularValidationReportRow(cells);
    }
}
