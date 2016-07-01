package com.qdacity.server.project;

import javax.jdo.annotations.IdentityType;
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
