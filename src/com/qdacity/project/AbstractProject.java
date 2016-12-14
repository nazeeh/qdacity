package com.qdacity.project;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

import javax.jdo.annotations.Element;
import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.Inheritance;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;
import javax.jdo.annotations.InheritanceStrategy;



@PersistenceCapable(identityType = IdentityType.APPLICATION)
@Inheritance(strategy = InheritanceStrategy.SUBCLASS_TABLE)
public abstract class AbstractProject implements Serializable {
  @PrimaryKey
  @Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
  Long id;
  
  @Persistent
  String name;
  
  @Persistent
  String description;
  
  @Persistent
  Long codesystemID;
  
  @Persistent
  Long maxCodingID;
  
  @Persistent
  Integer revision;


  public AbstractProject(Project prj) {
    this.name = prj.name;
    this.codesystemID = prj.codesystemID;
    this.maxCodingID = prj.maxCodingID;
    this.revision = prj.revision;
    this.description = prj.description;
  }
  
  

  public AbstractProject(String name, Long codesystemID, Long maxCodingID, Integer revision) {
    this.name = name;
    this.codesystemID = codesystemID;
    this.maxCodingID = maxCodingID;
    this.revision = revision;
  }



  public AbstractProject() {
    // TODO Auto-generated constructor stub
  }

  public Long getId() {
    return id;
  }
  
  public void setId(Long id) {
    this.id = id;
  }
  
  public String getName() {
    return name;
  }
  
  public void setName(String name) {
    this.name = name;
  }
  
  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }
  
  public Long getCodesystemID() {
    return codesystemID;
  }
  
  public void setCodesystemID(Long codesystemID) {
    this.codesystemID = codesystemID;
  }
  
  public Long getMaxCodingID() {
    return maxCodingID;
  }
  
  public void setMaxCodingID(Long maxCodingID) {
    this.maxCodingID = maxCodingID;
  }
  
  public Integer getRevision() {
    return revision;
  }

  public void setRevision(Integer revision) {
    this.revision = revision;
  }
}
