package com.qdacity.project.metrics;

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
  double paragraphFMeasure;
  
  @Persistent(defaultFetchGroup="true", dependent="true" )
  double paragraphRecall;
  
  @Persistent(defaultFetchGroup="true", dependent="true" )
  double paragraphPrecision;

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

  public double getParagraphFMeasure() {
    return paragraphFMeasure;
  }

  public void setParagraphFMeasure(double paragraphFMeasure) {
    this.paragraphFMeasure = paragraphFMeasure;
  }

  public double getParagraphRecall() {
    return paragraphRecall;
  }

  public void setParagraphRecall(double paragraphRecall) {
    this.paragraphRecall = paragraphRecall;
  }

  public double getParagraphPrecision() {
    return paragraphPrecision;
  }

  public void setParagraphPrecision(double paragraphPrecision) {
    this.paragraphPrecision = paragraphPrecision;
  }
}
