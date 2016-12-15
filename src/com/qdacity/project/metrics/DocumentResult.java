package com.qdacity.project.metrics;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

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
  Long originDocumentID;
  
  @Persistent
  String documentName;
  
  
  @Persistent(defaultFetchGroup="true", dependent="true" )
  @Column(name="paragraphAgreement")
  ParagraphAgreement paragraphAgreement;
  
//  @Persistent(defaultFetchGroup="true") 
//  @Element(dependent = "true")
//  @Column(name="codingResults")
//  List<CodingResults> codingResults;
  
  
  @Persistent
  List<String> truePositives;
  
  @Persistent
  List<String> falsePositives;
  
  @Persistent
  List<String> falseNegatives;
  
  
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
//    this.codingResults = new ArrayList<CodingResults>();
    this.truePositives = copy.truePositives;
    this.falsePositives = copy.falsePositives;
    this.falseNegatives = copy.falseNegatives;
//    for (CodingResults copyResults : copy.codingResults) {
//      this.codingResults.add(new CodingResults(copyResults));
//    }
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

  public Long getOriginDocumentID() {
    return originDocumentID;
  }

  public void setOriginDocumentID(Long originDocumentID) {
    this.originDocumentID = originDocumentID;
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
  
//  public List<CodingResults> getCodingResults() {
//    if (codingResults == null) codingResults =  new ArrayList<CodingResults>();
//    return codingResults;
//  }
//
//  public void setCodingResults(List<CodingResults> codingResults) {
//    this.codingResults = codingResults;
//  }
  
  public List<String> getTruePositives() {
    return truePositives;
  }

  public void setTruePositives(List<String> truePositives) {
    this.truePositives = truePositives;
  }

  public List<String> getFalsePositives() {
    return falsePositives;
  }

  public void setFalsePositives(List<String> falsePositives) {
    this.falsePositives = falsePositives;
  }

  public List<String> getFalseNegatives() {
    return falseNegatives;
  }

  public void setFalseNegatives(List<String> falseNegatives) {
    this.falseNegatives = falseNegatives;
  }

  public AgreementMap getAgreementMap() {
    return agreementMap;
  }

  public void setAgreementMap(AgreementMap agreementMap) {
    this.agreementMap = agreementMap;
  }
  
  public void addCodingResults(DocumentResult newResult){
    
    List<String> newTP = newResult.getTruePositives();
    List<String> newFP = newResult.getFalsePositives();
    List<String> newFN = newResult.getFalseNegatives();
    
    
    if (this.truePositives == null) this.truePositives = new ArrayList<String>(newTP.size());

    if (this.falsePositives == null) this.falsePositives = new ArrayList<String>(newFP.size());
    if (this.falseNegatives == null) this.falseNegatives = new ArrayList<String>(newFN.size());
    Logger.getLogger("logger").log(Level.INFO,   "Adding to truepositives  "+truePositives.size() + " / " +newTP.size());
    for(int i = 0; i < this.truePositives.size(); i++){
      String aggregatedList = this.truePositives.get(i).replaceAll("^\\[|]$", "");
      aggregatedList += "," + newTP.get(i).replaceAll("^\\[|]$", "");
      truePositives.set(i, "["+aggregatedList+"]");
    }
    
    for(int i = 0; i < this.falsePositives.size(); i++){
      String aggregatedList = this.falsePositives.get(i).replaceAll("^\\[|]$", "");
      aggregatedList += "," + newTP.get(i).replaceAll("^\\[|]$", "");
      falsePositives.set(i, "["+aggregatedList+"]");
    }
    
    for(int i = 0; i < this.falseNegatives.size(); i++){
      String aggregatedList = this.falseNegatives.get(i).replaceAll("^\\[|]$", "");
      aggregatedList += "," + newTP.get(i).replaceAll("^\\[|]$", "");
      falseNegatives.set(i, "["+aggregatedList+"]");
    }
  }
  
  public void generateAgreementMap(TextDocument textDocument) {
    Document originalDoc = Jsoup.parse(textDocument.getText().getValue());
    Elements paragraphs = originalDoc.select("p");
    for (int i = 0; i < paragraphs.size(); i++) {
      org.jsoup.nodes.Element paragraph = paragraphs.get(i);
      //CodingResults measurements = this.codingResults.get(i);
      
      Logger.getLogger("logger").log(Level.INFO,   "TruePositives i: " + truePositives.get(i));
      Integer tpCount = stringToList(truePositives.get(i)).size();
      Integer fpCount = stringToList(falsePositives.get(i)).size();
      Integer fnCount = stringToList(falseNegatives.get(i)).size();
      
      Logger.getLogger("logger").log(Level.INFO,   "tpCount: " + tpCount);
      
      paragraph.attr("truePosCount", tpCount.toString());
      paragraph.attr("falsePosCount", fpCount.toString());
      paragraph.attr("falseNegCount", fnCount.toString());
    }
    
    textDocument.setText(new Text(originalDoc.toString()));
    AgreementMap map = new AgreementMap(textDocument.getId(),textDocument.getProjectID(), textDocument.getTitle(), originalDoc.toString());
    this.agreementMap = map;
  }
  
  private List<String> stringToList(String listString){
    String withoutBrackets = listString.replaceAll("^\\[|]$", "");
    if (withoutBrackets.isEmpty()) return new ArrayList<String>();
    
    List<String> list = new ArrayList<String>(Arrays.asList(withoutBrackets.split(",")));  
    return list;
  }
}
