package com.qdacity.project.metrics;

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
public class TabularValidationReportRow {

    public TabularValidationReportRow(Long tabularValidationReportId) {
	assert (tabularValidationReportId != null);
	this.tabularValidationReportId = tabularValidationReportId;
    }

    @PrimaryKey
    @Persistent(
	    valueStrategy = IdGeneratorStrategy.IDENTITY)
    Long id;

    @Persistent
    Long tabularValidationReportId;

    @Persistent
    String rowCsvString; //Contains the row data as CSV String

    public Long getId() {
	return id;
    }

    public void setId(Long id) {
	this.id = id;
    }

    public Long getTabularValidationReportId() {
	return tabularValidationReportId;
    }

    public void setTabularValidationReportId(Long tabularValidationReportId) {
	this.tabularValidationReportId = tabularValidationReportId;
    }

    /**
     * Retrieve the Row as List of Strings representing a cell.
     * @return the row as cells in a list
     */
    public List<String> getCells() {
	return Arrays.asList(rowCsvString.split(TabularValidationReport.ROW_STRING_FORMAT_REGEXP));
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
	this.rowCsvString = csvRow.substring(0, csvRow.length()-1); //remove last comma
    }

}
