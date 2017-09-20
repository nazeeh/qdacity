package com.qdacity.course;

import java.util.ArrayList;
import java.util.List;

import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;

import com.qdacity.course.TermCourse;

@PersistenceCapable(
	identityType = IdentityType.APPLICATION)

public class TermCourse extends Course {

	/**
	 * 
	 */
	private static final long serialVersionUID = 8884351707231058556L;

	@Persistent
	Long templateCourseID;
	
	@Persistent
	List<String> participants;


	@Persistent
	String term;

	public TermCourse() {
		super();
		// TODO Auto-generated constructor stub
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
	
	public void setCourseTemplateID(Long id) {
		this.templateCourseID = id;
	}
	
}
