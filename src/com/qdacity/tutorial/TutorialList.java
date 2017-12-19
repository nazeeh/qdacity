package com.qdacity.tutorial;

import java.util.Hashtable;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

@PersistenceCapable(
		identityType = IdentityType.APPLICATION)
public class TutorialList {

	@PrimaryKey
	@Persistent(
		valueStrategy = IdGeneratorStrategy.IDENTITY)
	private Long id;
	
	@Persistent
	Hashtable<Long, TutorialUnit> allTutorials;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Hashtable<Long, TutorialUnit> getAllTutorials() {
		return allTutorials;
	}

	public void setAllTutorials(Hashtable<Long, TutorialUnit> allTutorials) {
		this.allTutorials = allTutorials;
	}
	
	
	
	
	
}
