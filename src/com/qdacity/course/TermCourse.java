package com.qdacity.course;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import com.qdacity.course.TermCourse;

@PersistenceCapable(
	identityType = IdentityType.APPLICATION)

public class TermCourse implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = 4591418143332509129L;

	@PrimaryKey
	@Persistent(
		valueStrategy = IdGeneratorStrategy.IDENTITY)
	Long id;
	
	@Persistent
	Long templateCourseID;
	
	@Persistent
	List<String> participants;


	@Persistent
	String term;
	
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public TermCourse(TermCourse termCrs) {
		this.term = termCrs.term;
		this.participants = termCrs.participants;
	}
	
	

	public List<String> getParticipants() {
		return participants;
	}

	public void setParticipants(List<String> users) {
		this.participants = users;
	}

	public void addParticipants(String userID) {
		if (participants == null) participants = new ArrayList<String>();
		if (!participants.contains(userID)) participants.add(userID);
	}
	
	public void setTerm(String term) {
		this.term = term;
	}
	
	public String getTerm ()
	{
		return term;
	}
	public void setCourseTemplateID(Long id) {
		this.templateCourseID = id;
	}
	
}
