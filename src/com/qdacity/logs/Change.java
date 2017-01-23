package com.qdacity.logs;

import java.util.Date;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import com.qdacity.project.ProjectType;

@PersistenceCapable(identityType = IdentityType.APPLICATION)
public class Change {
	@PrimaryKey
	@Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
	Long id;
	@Persistent
	Date datetime;
	@Persistent
	Long projectID;
	@Persistent
	ProjectType projectType;
	@Persistent
	ChangeType changeType;
	@Persistent
	String userID;
	@Persistent
	ChangeObject objectType;
	@Persistent
	Long objectID;
	@Persistent
	String attributeType;
	@Persistent
	String oldValue;
	@Persistent
	String newValue;

	public Change(Date datetime, Long projectID, ProjectType projectType, ChangeType changeType, String userID, ChangeObject objectType, Long objectID) {
		super();
		this.datetime = datetime;
		this.projectID = projectID;
		this.projectType = projectType;
		this.changeType = changeType;
		this.userID = userID;
		this.objectType = objectType;
		this.objectID = objectID;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Date getDatetime() {
		return datetime;
	}

	public void setDatetime(Date datetime) {
		this.datetime = datetime;
	}

	public Long getProjectID() {
		return projectID;
	}

	public void setProjectID(Long projectID) {
		this.projectID = projectID;
	}

	public ProjectType getProjectType() {
		return projectType;
	}

	public void setProjectType(ProjectType projectType) {
		this.projectType = projectType;
	}

	public ChangeType getChangeType() {
		return changeType;
	}

	public void setChangeType(ChangeType changeType) {
		this.changeType = changeType;
	}

	public String getUserID() {
		return userID;
	}

	public void setUserID(String userID) {
		this.userID = userID;
	}

	public ChangeObject getObjectType() {
		return objectType;
	}

	public void setObjectType(ChangeObject objectType) {
		this.objectType = objectType;
	}

	public Long getObjectID() {
		return objectID;
	}

	public void setObjectID(Long objectID) {
		this.objectID = objectID;
	}

	public String getAttributeType() {
		return attributeType;
	}

	public void setAttributeType(String attributeType) {
		this.attributeType = attributeType;
	}

	public String getOldValue() {
		return oldValue;
	}

	public void setOldValue(String oldValue) {
		this.oldValue = oldValue;
	}

	public String getNewValue() {
		return newValue;
	}

	public void setNewValue(String newValue) {
		this.newValue = newValue;
	}

}
