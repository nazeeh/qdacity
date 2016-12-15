package com.qdacity.project.metrics;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.jdo.annotations.Column;
import javax.jdo.annotations.Element;
import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

@PersistenceCapable(identityType = IdentityType.APPLICATION)
public class ValidationReport {

  @PrimaryKey
  @Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
  Long id;

  @Persistent
  Long projectID;

  @Persistent
  Long revisionID;

  @Persistent
  String name;

  @Persistent
  Date datetime;

  @Persistent(defaultFetchGroup = "true", dependent = "true")
  @Column(name = "paragraphAgreement")
  ParagraphAgreement paragraphAgreement;

  // @Persistent(defaultFetchGroup="true")
  // @Element(dependent = "true")
  // @Column(name="validationResult")
  // List<ValidationResult> validationResult;

  @Persistent(defaultFetchGroup = "true")
  @Element(dependent = "true")
  @Column(name = "validationResultIDs")
  List<Long> validationResultIDs;

  @Persistent
  @Element(dependent = "true")
  @Column(name = "documentResults")
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
    if (validationResultIDs == null)
      validationResultIDs = new ArrayList<Long>();
    return validationResultIDs;
  }

  public void setValidationResultIDs(List<Long> validationResultIDs) {
    this.validationResultIDs = validationResultIDs;
  }

  // public List<ValidationResult> getValidationResult() {
  // return validationResult;
  // }
  //
  // public void setValidationResult(List<ValidationResult> validationResult) {
  // this.validationResult = validationResult;
  // }
  //
  public void addResult(ValidationResult result) {
    if (validationResultIDs == null)
      validationResultIDs = new ArrayList<Long>();
    validationResultIDs.add(result.getId());
    // validationResult.add(result);

    // aggregateDocumentResults(result);

    ParagraphAgreement agreement = result.getParagraphAgreement();
    if (paragraphAgreement == null)
      paragraphAgreement = new ParagraphAgreement();

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

  public ParagraphAgreement getParagraphAgreement() {
    return paragraphAgreement;
  }

  public void setParagraphAgreement(ParagraphAgreement paragraphAgreement) {
    this.paragraphAgreement = paragraphAgreement;
  }

  public List<DocumentResult> getDocumentResults() {
    if (documentResults == null)
      documentResults = new ArrayList<DocumentResult>();
    return documentResults;
  }

  public void setDocumentResults(List<DocumentResult> documentResults) {
    this.documentResults = documentResults;
  }

  public void addDocumentResult(DocumentResult result) {
    if (this.documentResults == null)
      this.documentResults = new ArrayList<DocumentResult>();
    Boolean merged = mergeDocumentResults(result);
    if (!merged)
      documentResults.add(new DocumentResult(result));
  }

  private void aggregateDocumentResults(ValidationResult result) {
    if (this.documentResults == null)
      this.documentResults = new ArrayList<DocumentResult>();
    for (DocumentResult newResult : result.getDocumentResults()) {
      Boolean merged = mergeDocumentResults(newResult);
      if (!merged)
        documentResults.add(new DocumentResult(newResult));
    }
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

  public void setDocumentResultAverage(Long docID, ParagraphAgreement averageAgreement) {
    for (DocumentResult aggregated : documentResults) {
      if (aggregated.getDocumentID().equals(docID)) {
        aggregated.setParagraphAgreement(averageAgreement);
      }
    }
  }

  // private Boolean mergeDocumentAgreement(Long docID, ParagraphAgreement averageAgreement){
  // for (DocumentResult aggregated : documentResults) {
  // if (aggregated.getDocumentID().equals(newResult.getDocumentID())){
  // aggregated.addCodingResults(newResult.getCodingResults());
  //
  // return true;
  // }
  // }
  // return false;
  // }

}
