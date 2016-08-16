package com.qdacity.project;

import java.util.ArrayList;
import java.util.List;

import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;



@PersistenceCapable(identityType = IdentityType.APPLICATION)
public class Project extends AbstractProject{
  
  @Persistent
  List<String> owners;
  
  @Persistent
  List<String> coders;
  
  @Persistent
  List<String> validationCoders;
  
  @Persistent
  List<String> invitedUsers;
  
  

  public Project() {
    super();
    // TODO Auto-generated constructor stub
  }

  public Project(Project prj) {
    super(prj);
    // TODO Auto-generated constructor stub
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
  
  public void removeUser(String userID){
    if (owners == null) owners = new ArrayList<String>();
    if (coders == null) coders = new ArrayList<String>();
    if (validationCoders == null) validationCoders = new ArrayList<String>();
    owners.remove(userID);
    coders.remove(userID);
    validationCoders.remove(userID);
  }
  
  
  
}
