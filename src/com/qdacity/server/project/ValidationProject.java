package com.qdacity.server.project;

import java.util.ArrayList;
import java.util.List;

import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.Inheritance;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;

@PersistenceCapable(identityType = IdentityType.APPLICATION)
@Inheritance(customStrategy = "complete-table")
public class ValidationProject extends ProjectRevision {
  
  @Persistent
  List<String> validationCoders;
  @Persistent
  Long revisionID;
  @Persistent
  double paragraphFMeasure;
  
  public ValidationProject(Project prj, Long projectID, String comment) {
    super(prj, projectID, comment);
    // TODO Auto-generated constructor stub
  }
  
  
  public ValidationProject(ProjectRevision prjRev) {
    super(prjRev);
    this.revisionID = prjRev.getId();
    // TODO Auto-generated constructor stub
  }
  
  
  public Long getRevisionID() {
    return revisionID;
  }



  public void setRevisionID(Long revisionID) {
    this.revisionID = revisionID;
  }



  public List<String> getValidationCoders() {
    return validationCoders;
  }

  public void setValidationCoders(List<String> validationCoders) {
    this.validationCoders = validationCoders;
  }
  
  public void addValidationCoder(String userID){
    if (validationCoders == null) validationCoders = new ArrayList<String>();
    if (!validationCoders.contains(userID)) validationCoders.add(userID);
  }


  public double getParagraphFMeasure() {
    return paragraphFMeasure;
  }


  public void setParagraphFMeasure(double paragraphAgreement) {
    this.paragraphFMeasure = paragraphAgreement;
  }
  
  

}
