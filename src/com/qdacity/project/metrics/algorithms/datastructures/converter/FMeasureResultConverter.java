package com.qdacity.project.metrics.algorithms.datastructures.converter;

import com.qdacity.project.metrics.FMeasureResult;
import com.qdacity.project.metrics.TabularReportRow;
import java.util.ArrayList;
import java.util.List;


/**
 * Can convert ParagraphAgreement Objects to TabularReportRow Objects and back.
 * This class could also be used for Data migration.
 */
public class FMeasureResultConverter {

    private static final int FMEASURE_INDEX = 1;
    private static final int RECALL_INDEX = 2;
    private static final int PRECISION_INDEX = 3;

    public static FMeasureResult tabularValidationReportRowToFMeasureResult(TabularReportRow tabularReportRow) {
	FMeasureResult paragraphAgreement = new FMeasureResult();

	if(tabularReportRow.getCells().size() < 4) {
	    throw new IllegalArgumentException("You did not provide a tabularReportRow, which can be converted to a ParagraphAgreement");
	}

	paragraphAgreement.setFMeasure(Double.parseDouble(tabularReportRow.getCells().get(FMEASURE_INDEX)));
	paragraphAgreement.setRecall(Double.parseDouble(tabularReportRow.getCells().get(RECALL_INDEX)));
	paragraphAgreement.setPrecision(Double.parseDouble(tabularReportRow.getCells().get(PRECISION_INDEX)));

	return paragraphAgreement;
    }

    public static TabularReportRow fmeasureResultToTabularReportRow(FMeasureResult fmeasureResult, String coderName) {
	List<String> columns = new ArrayList<>();
	columns.add(coderName);
	columns.add(fmeasureResult.getFMeasure()+"");
	columns.add(fmeasureResult.getRecall()+"");
	columns.add(fmeasureResult.getPrecision()+"");

	return 	new TabularReportRow(columns);
    }

}
