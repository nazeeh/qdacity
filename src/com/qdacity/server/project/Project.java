package com.qdacity.server.project;

import java.util.ArrayList;
import java.util.List;

import javax.jdo.annotations.Element;
import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;


@PersistenceCapable(identityType = IdentityType.APPLICATION)
public class Project {
	@PrimaryKey
	@Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
	Long id;
	
	@Persistent
	String name;
	
	@Persistent
	Long codesystemID;
	
	@Persistent
	Long maxCodingID;
	
	@Persistent
	List<String> users;
	
	@Persistent
	List<String> invitedUsers;
	
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
	
	public Long getCodesystemID() {
		return codesystemID;
	}
	
	public void setCodesystemID(Long codesystemID) {
		this.codesystemID = codesystemID;
	}
	
	public Long getMaxCodingID() {
		return maxCodingID;
	}
	
	public void setMaxCodingID(Long maxCodingID) {
		this.maxCodingID = maxCodingID;
	}

	public List<String> getUsers() {
		return users;
	}

	public void setUsers(List<String> users) {
		this.users = users;
	}
	
	public void addUser(String userID){
		if (users == null) users = new ArrayList<String>();
		if (!users.contains(userID)) users.add(userID);
	}

	public List<String> getInvitedUsers() {
		return invitedUsers;
	}

	public void setInvitedUsers(List<String> invitedUsers) {
		this.invitedUsers = invitedUsers;
	}
	
	public void addInvitedUser(String userID){
		if (invitedUsers == null) invitedUsers = new ArrayList<String>();
		if (!invitedUsers.contains(userID)) invitedUsers.add(userID);
	}
	
	
	
	
}
