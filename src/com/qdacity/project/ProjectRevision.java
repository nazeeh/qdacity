package com.qdacity.project;

import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.Inheritance;
import javax.jdo.annotations.InheritanceStrategy;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;


@PersistenceCapable(identityType = IdentityType.APPLICATION)
public class ProjectRevision extends AbstractProject {
  @Persistent
  Long projectID;
  
  @Persistent
  String comment;
  
  public ProjectRevision(Project prj, Long projectID, String comment) {
    super(prj);
    super.setRevision(revision);
    this.projectID = projectID;
    this.comment = comment;
  }
  
  public ProjectRevision(ProjectRevision prjRev) {
    super(prjRev.getName(), prjRev.getCodesystemID(), 0L, prjRev.getRevision());
    this.projectID = prjRev.getProjectID();
    this.comment = prjRev.getComment();
  }

  public Long getProjectID() {
    return projectID;
  }

  public void setProjectID(Long projectID) {
    this.projectID = projectID;
  }

  public String getComment() {
    return comment;
  }

  public void setComment(String comment) {
    this.comment = comment;
  }
}
