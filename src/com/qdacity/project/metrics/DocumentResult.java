package com.qdacity.project.metrics;

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
public class DocumentResult {
  @PrimaryKey
  @Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
  private Key key;
  
  @Persistent
  Long documentID;
  
  @Persistent
  String documentName;
  
  @Persistent(defaultFetchGroup="true", dependent="true" )
  @Column(name="paragraphAgreement")
  ParagraphAgreement paragraphAgreement;

  public Long getDocumentID() {
    return documentID;
  }

  public void setDocumentID(Long documentID) {
    this.documentID = documentID;
  }

  public String getDocumentName() {
    return documentName;
  }

  public void setDocumentName(String documentName) {
    this.documentName = documentName;
  }

  public ParagraphAgreement getParagraphAgreement() {
    return paragraphAgreement;
  }

  public void setParagraphAgreement(ParagraphAgreement paragraphAgreement) {
    this.paragraphAgreement = paragraphAgreement;
  }

  
  
  

}
