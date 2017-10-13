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
	Long courseID;
	
	@Persistent
	List<String> participants;


	@Persistent
	String term;
	
	@Persistent
	List<String> owners;
	
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
	
	public String getTerm ()
	{
		return term;
	}
	public void setCourseID(Long id) {
		this.courseID = id;
	}

	public List<String> getOwners() {
		return owners;
	}

	public void setOwners(List<String> users) {
		this.owners = users;
	}

	public void addOwner(String userID) {
		if (owners == null) owners = new ArrayList<String>();
		if (!owners.contains(userID)) owners.add(userID);
	}
	
	public void addParticipant(String userID) {
		if (participants == null) participants = new ArrayList<String>();
		if (!participants.contains(userID)) participants.add(userID);
	}
	
}
