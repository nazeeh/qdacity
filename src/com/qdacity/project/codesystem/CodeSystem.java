package com.qdacity.project.codesystem;

import java.util.ArrayList;
import java.util.List;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import com.qdacity.project.ProjectType;

@PersistenceCapable(
	identityType = IdentityType.APPLICATION)
public class CodeSystem {
	@PrimaryKey
	@Persistent(
		valueStrategy = IdGeneratorStrategy.IDENTITY)
	Long id;
	@Persistent
	Long project;
	@Persistent
	ProjectType projectType;
	@Persistent
	List<Long> codeIDs = new ArrayList<Long>();

	@Persistent
	Long maxCodeID;

	public CodeSystem(CodeSystem codesystem) {
		this.project = codesystem.project;
		this.maxCodeID = codesystem.maxCodeID;
		this.codeIDs = new ArrayList<Long>(codesystem.codeIDs);
	}

	public CodeSystem() {
		maxCodeID = 0L;
	}

	public CodeSystem(Long projectId, List<Long> codes) {
		this.project = projectId;
		this.codeIDs = codes;
	}

	public void removeCode(Long codeID) {
		codeIDs.remove(codeID);

	}

	public void addCode(Long codeID) {
		codeIDs.add(codeID);
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public List<Long> getCodeIDs() {
		return codeIDs;
	}

	public void setCodeIDs(List<Long> codeIDs) {
		this.codeIDs = codeIDs;
	}

	public Long getProject() {
		return project;
	}

	public void setProject(Long project) {
		this.project = project;
	}

	public Long getMaxCodeID() {
		return maxCodeID;
	}

	public void setMaxCodeID(Long maxCodeID) {
		this.maxCodeID = maxCodeID;
	}

	public ProjectType getProjectType() {
		return projectType;
	}

	public void setProjectType(ProjectType projectType) {
		this.projectType = projectType;
	}

}
