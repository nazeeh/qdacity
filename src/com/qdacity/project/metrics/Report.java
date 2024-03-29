package com.qdacity.project.metrics;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.jdo.annotations.*;

@PersistenceCapable(
	identityType = IdentityType.APPLICATION)
@Inheritance(
		strategy = InheritanceStrategy.SUBCLASS_TABLE)

public abstract class Report {

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
	
	//Hint: The following Rows are saved as csv Strings for efficiency
	@Persistent
	@Column(name = "avgAgreementHead")
	String averageAgreementHeaderCsvString; //Hint: This used to be hardcoded in the Frontend in older Versions.
	@Persistent
	@Column(name = "avgAgreement")
	String averageAgreementCsvString; //Hint: This used to be ParagraphAgreement in older Versions. Important for migration!
	@Persistent
	@Column(name = "detailedAgreementHead")
	String detailedAgreementHeaderCsvString;
	@Persistent
	@Column(name = "evaluationUnit")
	String evaluationUnit;
	@Column(name = "evaluationMethod")
	String evaluationMethod;

	@Persistent(
		defaultFetchGroup = "true")
	@Element(
		dependent = "true")
	@Column(
		name = "validationResultIDs")
	List<Long> validationResultIDs;

	@Persistent
	@Element(
		dependent = "true")
	@Column(
		name = "documentResults")
	List<DocumentResult> documentResults;

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

	public List<Long> getValidationResultIDs() {
		if (validationResultIDs == null) validationResultIDs = new ArrayList<Long>();
		return validationResultIDs;
	}

	public void setValidationResultIDs(List<Long> validationResultIDs) {
		this.validationResultIDs = validationResultIDs;
	}

	public void addResult(ValidationResult result) {
		if (validationResultIDs == null) validationResultIDs = new ArrayList<Long>();
		validationResultIDs.add(result.getId());

		//if (reportRow == null) reportRow = new TabularValidationReportRow(0); TODO why?
	}
	
	public String getEvaluationUnit() { //Hint: needs to be String to be parseable
	    return evaluationUnit;
	}

	public void setEvaluationUnit(EvaluationUnit evaluationUnit) {
	    this.evaluationUnit = evaluationUnit.toString();
	}

	public String getEvaluationMethod() {
	    return evaluationMethod;
	}

	public void setEvaluationType(EvaluationMethod evaluationMethod) {
	    this.evaluationMethod = evaluationMethod.toString();
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

	public void setAverageAgreementRow(TabularReportRow reportRow) {
	    this.averageAgreementCsvString = reportRow.toString();
	}

	public void setAverageAgreementHeader(TabularReportRow averageAgreementHeaderCsvString) {
	    this.averageAgreementHeaderCsvString = averageAgreementHeaderCsvString.toString();
	}

	public void setAverageAgreement(TabularReportRow averageAgreementCsvString) {
	    this.averageAgreementCsvString = averageAgreementCsvString.toString();
	}

	public void setDetailedAgreementHeader(TabularReportRow detailedAgreementHeaderCsvString) {
	    this.detailedAgreementHeaderCsvString = detailedAgreementHeaderCsvString.toString();
	}

	public String getAverageAgreementHeaderCsvString() {
	    return averageAgreementHeaderCsvString;
	}

	public String getAverageAgreementCsvString() {
	    return averageAgreementCsvString;
	}

	public String getDetailedAgreementHeaderCsvString() {
	    return detailedAgreementHeaderCsvString;
	}
	
	public List<DocumentResult> getDocumentResults() {
		if (documentResults == null) documentResults = new ArrayList<DocumentResult>();
		return documentResults;
	}

	public void setDocumentResults(List<DocumentResult> documentResults) {
		this.documentResults = documentResults;
	}

	public void addDocumentResult(DocumentResult result) {
		if (this.documentResults == null) this.documentResults = new ArrayList<DocumentResult>();
		Boolean merged = mergeDocumentResults(result);
		if (!merged) documentResults.add(new DocumentResult(result));
	}

	private Boolean mergeDocumentResults(DocumentResult newResult) {
		for (DocumentResult aggregated : documentResults) {
			if (aggregated.getDocumentID().equals(newResult.getDocumentID())) {
				aggregated.addCodingResults(newResult);

				return true;
			}
		}
		return false;
	}

	public void setDocumentResultAverage(Long docID, TabularReportRow averageAgreement) {
		for (DocumentResult aggregated : documentResults) {
			if (aggregated.getDocumentID().equals(docID)) {
				aggregated.setReportRow(averageAgreement.toString());
			}
		}
	}

}
