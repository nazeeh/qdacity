package com.qdacity.project;

import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;

@PersistenceCapable(
	identityType = IdentityType.APPLICATION)
public class ProjectRevision extends AbstractProject {
	/**
	 * 
	 */
	private static final long serialVersionUID = -802031230147462525L;

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
		this.description = prjRev.getDescription();
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
