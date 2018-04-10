package com.qdacity.exercise;

import java.io.Serializable;
import java.util.Date;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

@PersistenceCapable(
	identityType = IdentityType.APPLICATION)


public class Exercise implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = 5474843555409444467L;

	@PrimaryKey
	@Persistent(
		valueStrategy = IdGeneratorStrategy.IDENTITY)
	Long id;
	
	@Persistent
	Long termCourseID;

	@Persistent
	Date exerciseDeadline;

	@Persistent
	String name;
	
	@Persistent
	Long projectRevisionID;

	@Persistent
	ExerciseType exerciseType;

	public Exercise() {
		super();
		// TODO Auto-generated constructor stub
	}
	
	public Long getId() {
		return id;
	}
	
	public void setId(Long id) {
		this.id = id;
	}
	
	public Long getProjectRevisionID() {
		return projectRevisionID;
	}
	
	public void setProjectRevisionID(Long projectRevisionID) {
		this.projectRevisionID = projectRevisionID;
	}
	
	public void setName(String name) {
		this.name = name;
	}
	
	public String getName() {
		return name;
	}
	
	public ExerciseType getExerciseType() { return exerciseType;}

	public void setExerciseType(ExerciseType exerciseType) {this.exerciseType = exerciseType;}

	public Long getTermCourseID() {
		return termCourseID;
	}
	
	public void setTermCourseID(Long termCourseID) {
		this.termCourseID = termCourseID;
	}

	public Date getExerciseDeadline() { return exerciseDeadline; }

	public void setExerciseDeadline(Date deadline) {this.exerciseDeadline = deadline; }
}
