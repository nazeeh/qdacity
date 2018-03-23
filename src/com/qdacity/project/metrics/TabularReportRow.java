package com.qdacity.project.metrics;

import java.io.Serializable;
import java.util.Arrays;
import java.util.List;
/**
 * A Row for the generic data structure TabularValidationReport. Make sure to
 * set a tabularValidationReportId
 */
public class TabularReportRow implements Serializable {

    /**
	 * 
	 */
	private static final long serialVersionUID = -6855616324566422223L;
	private final String ROW_STRING_FORMAT_REGEXP = "\\s*,\\s*";

    public TabularReportRow(TabularReportRow copy) {
	super();
	this.rowCsvString = copy.rowCsvString;
    }

    /**
     * Use this constructor if you save a reportRow as plain csvString in the
     * DataStore for efficiency reasons Be aware that a Row created with this
     * constructor does not have a Key and is not in a Parent-Child
     *
     * @param csvString a valid csv String representing a row
     */
    public TabularReportRow(String csvString) {
	this.rowCsvString = csvString;
    }

    public TabularReportRow(List<String> cells) {
	this.setRow(cells);
   }

    String rowCsvString; //Contains the row data as CSV String

    /**
     * Retrieve the Row as List of Strings representing a cell.
     *
     * @return the row as cells in a list
     */
    public List<String> getCells() {
	return Arrays.asList(rowCsvString.split(ROW_STRING_FORMAT_REGEXP));
    }

    /**
     * Adds the complete row to this object. Commas "," will be replaced with
     * HTML entity "&#44;"
     *
     * @param columns the colums in the row, can contain any UTF8 characters
     */
    public void setRow(List<String> columns) {
	String csvRow = "";
	for (String column : columns) {
	    csvRow += column.replace(",", "&#44;") + ","; //replace commas with html entity befor making a csv String!
	}
	this.rowCsvString = csvRow.substring(0, csvRow.length() - 1); //remove last comma
    }

    /**
     * Returns CSV String representation of row contents
     * @return 
     */
    @Override
    public String toString() {
	return this.rowCsvString;
    }

}
