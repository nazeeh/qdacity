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
  
  @Persistent(defaultFetchGroup="true", dependent="true" )
  @Column(name="paragraphAgreement")
  ParagraphAgreement paragraphAgreement;
  
  @Persistent(defaultFetchGroup="true") 
  @Element(dependent = "true")
  @Column(name="validationResult")
  List<ValidationResult> validationResult;

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


  public List<ValidationResult> getValidationResult() {
    return validationResult;
  }

  public void setValidationResult(List<ValidationResult> validationResult) {
    this.validationResult = validationResult;
  }
  
  public void addResult(ValidationResult result){
    if (validationResult == null) validationResult = new ArrayList<ValidationResult>();
    validationResult.add(result);
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
  
  
}
