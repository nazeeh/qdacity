package com.qdacity.project.metrics;

import java.util.ArrayList;
import java.util.List;

import javax.jdo.annotations.Column;
import javax.jdo.annotations.Element;
import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import com.google.appengine.api.datastore.Key;

@PersistenceCapable(identityType = IdentityType.APPLICATION)
public class ValidationResult {
  
  @PrimaryKey
  @Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
  private Key key;

  @Persistent(defaultFetchGroup="true", dependent="true" )
  String name;
  
  @Persistent(defaultFetchGroup="true", dependent="true" )
  Long validationProjectID;
  
  @Persistent(defaultFetchGroup="true", dependent="true" )
  Long revisionID;
  
  @Persistent(defaultFetchGroup="true", dependent="true" )
  @Column(name="paragraphAgreement")
  ParagraphAgreement paragraphAgreement;
  
  @Persistent(defaultFetchGroup="true") 
  @Element(dependent = "true")
  @Column(name="documentResults")
  List<DocumentResult> documentResults;

  public Key getKey() {
    return key;
  }

  public void setKey(Key key) {
    this.key = key;
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
  
  public void addDocumentResult(DocumentResult documentResult){
    if (this.documentResults == null) this.documentResults = new ArrayList<DocumentResult>();
    this.documentResults.add(documentResult);
  }

  public Long getRevisionID() {
    return revisionID;
  }
  
  
}
