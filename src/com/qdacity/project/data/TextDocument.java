package com.qdacity.project.data;

import java.io.Serializable;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import com.google.appengine.api.datastore.Text;
import com.qdacity.project.ProjectType;

@PersistenceCapable(
	identityType = IdentityType.APPLICATION)
public class TextDocument implements Serializable {
	/**
	 *
	 */
	private static final long serialVersionUID = 2828710144827032363L;

	@Persistent(
		valueStrategy = IdGeneratorStrategy.IDENTITY)
	@PrimaryKey
	Long id;

	@Persistent
	Long projectID;

	@Persistent
	String title;

	@Persistent
	Text text;

	@Persistent
	Long exerciseID;

	@Persistent
	Long positionInOrder;

	@Persistent
	ProjectType projectType;
	
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public Text getText() {
		return text;
	}

	public void setText(Text text) {
		this.text = text;
	}

	public Long getProjectID() {
		return projectID;
	}

	public void setProjectID(Long projectID) {
		this.projectID = projectID;
	}

	public Long getExerciseID() {
		return exerciseID;
	}

	public void setExerciseID(Long exerciseID) {
		this.exerciseID = exerciseID;
	}
	
	public Long getPositionInOrder() {
		return positionInOrder;
	}

	public void setPositionInOrder(Long positionInOrder) {
		this.positionInOrder = positionInOrder;
	}
	
	public ProjectType getProjectType() {
		return projectType;
	}

	public void setProjectType(ProjectType projectType) {
		this.projectType = projectType;
	}
}
