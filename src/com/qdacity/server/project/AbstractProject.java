package com.qdacity.server.project;

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
public abstract class AbstractProject {
  @PrimaryKey
  @Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
  Long id;
  
  @Persistent
  String name;
  
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
