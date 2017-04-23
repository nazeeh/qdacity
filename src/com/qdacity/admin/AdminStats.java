package com.qdacity.admin;

import java.util.Date;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

@PersistenceCapable(
	identityType = IdentityType.APPLICATION)
public class AdminStats {
	@PrimaryKey
	@Persistent(
		valueStrategy = IdGeneratorStrategy.IDENTITY)
	Long id;

	@Persistent
	Date dateTime;

	@Persistent
	Integer registeredUsers;

	@Persistent
	Integer activeUsers;

	@Persistent
	Integer projects;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Date getDateTime() {
		return dateTime;
	}

	public void setDateTime(Date dateTime) {
		this.dateTime = dateTime;
	}

	public Integer getRegisteredUsers() {
		return registeredUsers;
	}

	public void setRegisteredUsers(Integer registeredUsers) {
		this.registeredUsers = registeredUsers;
	}

	public Integer getActiveUsers() {
		return activeUsers;
	}

	public void setActiveUsers(Integer activeUsers) {
		this.activeUsers = activeUsers;
	}

	public Integer getProjects() {
		return projects;
	}

	public void setProjects(Integer projects) {
		this.projects = projects;
	}

}
