package com.qdacity.project.metrics;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

/**
 * A generic Datastructure for Tabular Validation Reports which consist of a
 * table sourrounded by two informative texts. Fill in as you need it.
 */
@PersistenceCapable(
	identityType = IdentityType.APPLICATION)
public class TabluarValidationReport {

    private static final String ROW_STRING_FORMAT_REGEXP = "\\s*,\\s*";

    @PrimaryKey
    @Persistent(
	    valueStrategy = IdGeneratorStrategy.IDENTITY)
    Long id;

    @Persistent
    Long projectID;

    @Persistent
    Long revisionID;

    @Persistent
    String name;

    @Persistent
    Date datetime;

    @Persistent
    String evaluationUnit;

    @Persistent
    String informationTextBefore;

    @Persistent
    String informationTextAfter;

    @Persistent
    List<String> rows; //Format as CSV

    public Long getId() {
	return id;
    }

    public void setId(Long id) {
	this.id = id;
    }

    public Long getProjectID() {
	return projectID;
    }

    public void setProjectID(Long projectID) {
	this.projectID = projectID;
    }

    public Long getRevisionID() {
	return revisionID;
    }

    public void setRevisionID(Long revisionID) {
	this.revisionID = revisionID;
    }

    public String getName() {
	return name;
    }

    public void setName(String name) {
	this.name = name;
    }

    public Date getDatetime() {
	return datetime;
    }

    public void setDatetime(Date datetime) {
	this.datetime = datetime;
    }

    public EvaluationUnit getEvaluationUnit() {
	return EvaluationUnit.fromString(evaluationUnit);
    }

    public void setEvaluationUnit(EvaluationUnit evaluationUnit) {
	this.evaluationUnit = evaluationUnit.toString();
    }

    public String getInformationTextBefore() {
	return informationTextBefore;
    }

    public void setInformationTextBefore(String informationTextBefore) {
	this.informationTextBefore = informationTextBefore;
    }

    public String getInformationTextAfter() {
	return informationTextAfter;
    }

    public void setInformationTextAfter(String informationTextAfter) {
	this.informationTextAfter = informationTextAfter;
    }

    public List<List<String>> getRowsParsed() {
	if (this.rows == null) {
	    return null;
	}
	List<List<String>> parsed = new ArrayList<>();
	for (String row : this.rows) {
	    parsed.add(Arrays.asList(row.split(ROW_STRING_FORMAT_REGEXP)));
	}
	return parsed;
    }

    /**
     * Make sure rows have a CSV format when using this method.
     *
     * @param rows
     */
    public void setRows(List<String> rows) {
	this.rows = rows;
    }

    /**
     * Adds a row to the table. Order of rows and columns is stable
     *
     * @param columns the colums in the row
     */
    public void addRow(List<String> columns) {
	String csvRow = "";
	if (this.rows == null) {
	    this.rows = new ArrayList<>();
	}
	for (String column : columns) {
	    csvRow += column.replace(",", "&#44;") + ","; //replace commas with html entity befor making a csv String!
	}
	this.rows.add(csvRow.substring(0, csvRow.length() - 1));
    }

}
