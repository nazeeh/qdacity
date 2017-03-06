package com.qdacity.user;

import java.io.Serializable;
import java.util.List;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import com.qdacity.project.ProjectType;

@PersistenceCapable(
	identityType = IdentityType.APPLICATION)
public class User implements Serializable {
	/**
	 * 
	 */
	private static final long serialVersionUID = 2378677713032476995L;

	@PrimaryKey
	@Persistent(
		valueStrategy = IdGeneratorStrategy.IDENTITY)
	String id;

	@Persistent
	UserType type;

	@Persistent
	String givenName;
	@Persistent
	String surName;

	@Persistent
	String email;

	@Persistent
	Long taskBoardID;

	@Persistent
	Long lastProjectId; // Used to pre-load to cache when user signs in

	@Persistent
	ProjectType lastProjectType; // Used to pre-load to cache when user signs in

	@Persistent
	List<Long> projects;

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getGivenName() {
		return givenName;
	}

	public void setGivenName(String givenName) {
		this.givenName = givenName;
	}

	public String getSurName() {
		return surName;
	}

	public void setSurName(String surName) {
		this.surName = surName;
	}

	public List<Long> getProjects() {
		return projects;
	}

	public void setProjects(List<Long> projects) {
		this.projects = projects;
	}

	public void addProjectAuthorization(Long project) {
		projects.add(project);
	}

	public void removeProjectAuthorization(Long project) {
		projects.remove(project);
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public Long getTaskBoardId() {
		return taskBoardID;
	}

	public void setTaskBoardId(Long taskBoardId) {
		this.taskBoardID = taskBoardId;
	}

	public UserType getType() {
		return type;
	}

	public void setType(UserType type) {
		this.type = type;
	}

	public Long getLastProjectId() {
		return lastProjectId;
	}

	public void setLastProjectId(Long lastProjectId) {
		this.lastProjectId = lastProjectId;
	}

	public ProjectType getLastProjectType() {
		return lastProjectType;
	}

	public void setLastProjectType(ProjectType lastProjectType) {
		this.lastProjectType = lastProjectType;
	}

}
