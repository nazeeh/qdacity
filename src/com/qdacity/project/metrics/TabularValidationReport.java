package com.qdacity.project.metrics;

import java.io.Serializable;
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
public class TabularValidationReport implements Serializable {

    protected static final String ROW_STRING_FORMAT_REGEXP = "\\s*,\\s*";

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
    String headRow; //Format as CSV

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
	if (informationTextBefore == null) {
	    return "";
	}
	return informationTextBefore;
    }

    public void setInformationTextBefore(String informationTextBefore) {
	this.informationTextBefore = informationTextBefore;
    }

    public String getInformationTextAfter() {
	if (informationTextAfter == null) {
	    return "";
	}
	return informationTextAfter;
    }

    public void setInformationTextAfter(String informationTextAfter) {
	this.informationTextAfter = informationTextAfter;
    }

    /**
     * Retrieve the HeadRow as List of Strings representing a cell.
     *
     * @return the HeadRow as cells in a list
     */
    public List<String> getHeadRow() {
	return Arrays.asList(headRow.split(TabularValidationReport.ROW_STRING_FORMAT_REGEXP));
    }

    /**
     * Adds the complete headRow to this object. Commas "," will be replaced with
     * HTML entity "&#44;"
     *
     * @param columns the colums in the row, can contain any UTF8 characters
     */
    public void setHeadRow(List<String> columns) {
	String csvRow = "";
	for (String column : columns) {
	    csvRow += column.replace(",", "&#44;") + ","; //replace commas with html entity befor making a csv String!
	}
	this.headRow = csvRow.substring(0, csvRow.length()-1); //remove last comma;
    }

}
