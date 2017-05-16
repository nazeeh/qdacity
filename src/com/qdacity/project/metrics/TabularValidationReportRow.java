package com.qdacity.project.metrics;

import com.google.appengine.api.datastore.Key;
import java.io.Serializable;
import java.util.Arrays;
import java.util.List;
import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

/**
 * A Row for the generic data structure TabularValidationReport. Make sure to
 * set a tabularValidationReportId
 */
@PersistenceCapable(
	identityType = IdentityType.APPLICATION)
public class TabularValidationReportRow implements Serializable {

    private final String ROW_STRING_FORMAT_REGEXP = "\\s*,\\s*";

    public TabularValidationReportRow(Long validationReportId) {
	assert (this.validationReportId != null);
	this.validationReportId = validationReportId;
    }

    public TabularValidationReportRow(TabularValidationReportRow copy) {
	super();
	this.rowCsvString = copy.rowCsvString;
	this.validationReportId = copy.validationReportId;
    }

    /**
     * Use this constructor if you save a reportRow as plain csvString in the
     * DataStore for efficiency reasons Be aware that a Row created with this
     * constructor does not have a Key and is not in a Parent-Child
     *
     * @param csvString a valid csv String representing a row
     */
    public TabularValidationReportRow(String csvString) {
	this.rowCsvString = csvString;
    }

    public TabularValidationReportRow(List<String> cells) {
	this.setRow(cells);
   }

    @PrimaryKey
    @Persistent(
	    valueStrategy = IdGeneratorStrategy.IDENTITY)
    private Key key;

    @Persistent
    Long validationReportId;

    @Persistent
    String rowCsvString; //Contains the row data as CSV String

    public Long getValidationReportId() {
	return validationReportId;
    }

    public void setValidationReportId(Long validationReportId) {
	this.validationReportId = validationReportId;
    }

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

    public Key getKey() {
	return key;
    }

}
