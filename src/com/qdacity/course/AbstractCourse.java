package com.qdacity.course;
import java.io.Serializable;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.Inheritance;
import javax.jdo.annotations.InheritanceStrategy;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

@PersistenceCapable(
		identityType = IdentityType.APPLICATION)
	@Inheritance(
		strategy = InheritanceStrategy.SUBCLASS_TABLE)

public abstract class AbstractCourse implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = -5400293174435005226L;

	@PrimaryKey
	@Persistent(
		valueStrategy = IdGeneratorStrategy.IDENTITY)
	Long id;

	@Persistent
	String name;

	@Persistent
	String description;

	
	public AbstractCourse(Course crs) {
		this.name = crs.name;
		this.description = crs.description;
	}

	public AbstractCourse(String name) {
		this.name = name;
	}

	public AbstractCourse() {
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

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	
}
