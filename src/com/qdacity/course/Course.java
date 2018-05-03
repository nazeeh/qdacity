package com.qdacity.course;

import java.util.ArrayList;
import java.util.List;

import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;

@PersistenceCapable(
	identityType = IdentityType.APPLICATION)


public class Course extends AbstractCourse {

	/**
	 * 
	 */
	private static final long serialVersionUID = 5891681710877887556L;

	@Persistent
	List<String> owners;

	@Persistent
	List<Long> owningUserGroups;

	@Persistent
	List<String> invitedUsers;

	public Course() {
		super();
		// TODO Auto-generated constructor stub
	}

	public Course(Course crs) {
		super(crs);
		// TODO Auto-generated constructor stub
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

	public List<String> getInvitedUsers() {
		return invitedUsers;
	}

	public void setInvitedUsers(List<String> invitedUsers) {
		this.invitedUsers = invitedUsers;
	}

	public void addInvitedUser(String userID) {
		if (invitedUsers == null) invitedUsers = new ArrayList<String>();
		if (!invitedUsers.contains(userID)) invitedUsers.add(userID);
	}


	public void removeUser(String userID) {
		if (owners == null) owners = new ArrayList<String>();
		owners.remove(userID);
	}

	public List<Long> getOwningUserGroups() {
		if(owningUserGroups == null) owningUserGroups = new ArrayList<Long>();
		return owningUserGroups;
	}

	public void setOwningUserGroups(List<Long> owningUserGroups) {
		this.owningUserGroups = owningUserGroups;
	}
}
