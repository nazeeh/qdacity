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
	List<String> owners;
	
	@Persistent
  List<String> coders;
	
	@Persistent
  List<String> validationCoders;
	
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

	public List<String> getOwners() {
		return owners;
	}

	public void setOwners(List<String> users) {
		this.owners = users;
	}
	
	public void addOwner(String userID){
		if (owners == null) owners = new ArrayList<String>();
		if (!owners.contains(userID)) owners.add(userID);
	}

	public void removeOwner(String userID){
    if (owners == null) owners = new ArrayList<String>();
    owners.remove(userID);
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

  public List<String> getValidationCoders() {
    return validationCoders;
  }

  public void setValidationCoders(List<String> validationCoders) {
    this.validationCoders = validationCoders;
  }
	
  public void addValidationCoder(String userID){
    if (validationCoders == null) validationCoders = new ArrayList<String>();
    if (!validationCoders.contains(userID)) validationCoders.add(userID);
  }
	
  public void removeValidationCoder(String userID){
    if (validationCoders == null) validationCoders = new ArrayList<String>();
    validationCoders.remove(userID);
  }

  public List<String> getCoders() {
    return coders;
  }

  public void setCoders(List<String> coders) {
    this.coders = coders;
  }
  
  public void addCoder(String userID){
    if (coders == null) coders = new ArrayList<String>();
    if (!coders.contains(userID)) coders.add(userID);
  }
  
  public void removeCoder(String userID){
    if (coders == null) coders = new ArrayList<String>();
    coders.remove(userID);
  }
}
