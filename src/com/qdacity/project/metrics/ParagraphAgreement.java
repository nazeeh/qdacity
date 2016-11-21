package com.qdacity.project.metrics;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import com.google.appengine.api.datastore.Key;

@PersistenceCapable(identityType = IdentityType.APPLICATION)
public class ParagraphAgreement {
  @PrimaryKey
  @Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
  private Key key;
  
  @Persistent(defaultFetchGroup="true", dependent="true" )
  double fMeasure;
  
  @Persistent(defaultFetchGroup="true", dependent="true" )
  double recall;
  
  @Persistent(defaultFetchGroup="true", dependent="true" )
  double precision;

  public double getFMeasure() {
    return fMeasure;
  }

  public void setFMeasure(double paragraphFMeasure) {
    this.fMeasure = paragraphFMeasure;
  }

  public double getRecall() {
    return recall;
  }

  public void setRecall(double paragraphRecall) {
    this.recall = paragraphRecall;
  }

  public double getPrecision() {
    return precision;
  }

  public void setPrecision(double paragraphPrecision) {
    this.precision = paragraphPrecision;
  }
}
