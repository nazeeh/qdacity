package com.qdacity.project.metrics;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

import javax.jdo.annotations.Column;
import javax.jdo.annotations.Element;
import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;
import javax.persistence.CascadeType;
import javax.persistence.OneToMany;

@PersistenceCapable(
	identityType = IdentityType.APPLICATION)
public class ValidationResult implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = 2809724253613296102L;

	@PrimaryKey
	@Persistent(
		valueStrategy = IdGeneratorStrategy.IDENTITY)
	private Long id;

	@Persistent(
		defaultFetchGroup = "true",
		dependent = "true")
	Long reportID;

	@Persistent(
		defaultFetchGroup = "true",
		dependent = "true")
	String name;

	@Persistent(
		defaultFetchGroup = "true",
		dependent = "true")
	Long validationProjectID;

	@Persistent(
		defaultFetchGroup = "true",
		dependent = "true")
	Long revisionID;

	@Persistent(
		defaultFetchGroup = "true",
		dependent = "true")
	@Column(
		name = "paragraphAgreement")
	ParagraphAgreement paragraphAgreement;

	@Persistent
	@OneToMany(
		cascade = CascadeType.ALL)
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

	public Long getReportID() {
		return reportID;
	}

	public void setReportID(Long reportID) {
		this.reportID = reportID;
	}

	public Long getValidationProjectID() {
		return validationProjectID;
	}

	public void setValidationProjectID(Long validationProjectID) {
		this.validationProjectID = validationProjectID;
	}

	public Long getRevisionId() {
		return revisionID;
	}

	public void setRevisionID(Long ID) {
		this.revisionID = ID;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public ParagraphAgreement getParagraphAgreement() {
		return paragraphAgreement;
	}

	public void setParagraphAgreement(ParagraphAgreement paragraphAgreement) {
		this.paragraphAgreement = paragraphAgreement;
	}

	public List<DocumentResult> getDocumentResults() {
		return documentResults;
	}

	public void setDocumentResults(List<DocumentResult> documentResults) {
		this.documentResults = documentResults;
	}

	public void addDocumentResult(DocumentResult documentResult) {
		if (this.documentResults == null) this.documentResults = new ArrayList<DocumentResult>();
		this.documentResults.add(documentResult);
	}

	public Long getRevisionID() {
		return revisionID;
	}
}
