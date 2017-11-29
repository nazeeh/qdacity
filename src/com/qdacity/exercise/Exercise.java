package com.qdacity.exercise;

import java.io.Serializable;

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
	String name;
	
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
	
	public void setName(String name) {
		this.name = name;
	}
	
	public String getName() {
		return name;
	}
	
	
	public Long getTermCourseID() {
		return termCourseID;
	}
	
	public void setTermCourseID(Long termCourseID) {
		this.termCourseID = termCourseID;
	}
	
}
