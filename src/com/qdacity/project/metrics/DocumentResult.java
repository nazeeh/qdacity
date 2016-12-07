package com.qdacity.project.metrics;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

import javax.jdo.annotations.Column;
import javax.jdo.annotations.Element;
import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.select.Elements;

import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.Text;
import com.qdacity.project.data.AgreementMap;
import com.qdacity.project.data.TextDocument;

@PersistenceCapable(identityType = IdentityType.APPLICATION)
public class DocumentResult  implements Serializable {
  
  @PrimaryKey
  @Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
  private Key key;
  
  @Persistent
  Long validationResultID;
  
  @Persistent
  Long documentID;
  
  @Persistent
  String documentName;
  
  
  @Persistent(defaultFetchGroup="true", dependent="true" )
  @Column(name="paragraphAgreement")
  ParagraphAgreement paragraphAgreement;
  
  @Persistent(defaultFetchGroup="true") 
  @Element(dependent = "true")
  @Column(name="codingResults")
  List<CodingResults> codingResults;
  
  @Persistent(defaultFetchGroup="true" , dependent="true" )
  AgreementMap agreementMap;
  
  
   public DocumentResult() {
    // TODO Auto-generated constructor stub
   }
  
  public DocumentResult(DocumentResult copy) {
    super();
    this.documentID = copy.documentID;
    this.documentName = copy.documentName;
    this.paragraphAgreement = new ParagraphAgreement(copy.paragraphAgreement);
    this.codingResults = new ArrayList<CodingResults>();
    for (CodingResults copyResults : copy.codingResults) {
      this.codingResults.add(new CodingResults(copyResults));
    }
  }
  
  
  

  public Key getKey() {
    return key;
  }

  public void setKey(Key key) {
    this.key = key;
  }

  public Long getDocumentID() {
    return documentID;
  }

  public void setDocumentID(Long documentID) {
    this.documentID = documentID;
  }
  
  

  public Long getValidationResultID() {
    return validationResultID;
  }

  public void setValidationResultID(Long validationResultID) {
    this.validationResultID = validationResultID;
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
  
  public List<CodingResults> getCodingResults() {
    if (codingResults == null) codingResults =  new ArrayList<CodingResults>();
    return codingResults;
  }

  public void setCodingResults(List<CodingResults> codingResults) {
    this.codingResults = codingResults;
  }
  
  

  

  public AgreementMap getAgreementMap() {
    return agreementMap;
  }

  public void setAgreementMap(AgreementMap agreementMap) {
    this.agreementMap = agreementMap;
  }

  public void addCodingResults(List<CodingResults> pCodingResults){
    if (this.codingResults == null) this.codingResults = new ArrayList<CodingResults>();
    if (this.codingResults.size() == 0) this.codingResults = pCodingResults;
    for(int i = 0; i < this.codingResults.size(); i++){
      this.codingResults.get(i).addCodingResults(pCodingResults.get(i));
    }
  }
  public void generateAgreementMap(TextDocument textDocument) {
    Document originalDoc = Jsoup.parse(textDocument.getText().getValue());
    Elements paragraphs = originalDoc.select("p");
    for (int i = 0; i < paragraphs.size(); i++) {
      org.jsoup.nodes.Element paragraph = paragraphs.get(i);
      CodingResults measurements = this.codingResults.get(i);
      paragraph.attr("truePosCount", String.valueOf(measurements.getTruePositives().size()));
      paragraph.attr("falsePosCount", String.valueOf(measurements.getFalsePositives().size()));
      paragraph.attr("falseNegCount", String.valueOf(measurements.getFalseNegatives().size()));
    }
    
    textDocument.setText(new Text(originalDoc.toString()));
    AgreementMap map = new AgreementMap(textDocument.getId(),textDocument.getProjectID(), textDocument.getTitle(), originalDoc.toString());
    this.agreementMap = map;
  }
 
  
}
