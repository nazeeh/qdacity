package com.qdacity.user;

import java.util.Date;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

@PersistenceCapable(identityType = IdentityType.APPLICATION)
public class UserNotification {
	@PrimaryKey
	@Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
	Long id;
	
	@Persistent
	Date datetime;
	
	@Persistent
	String user;
	
	@Persistent
	String originUser;
	
	@Persistent
	UserNotificationType type;
	
	@Persistent
	Long project;
	
	@Persistent
	String subject;
	
	@Persistent
	String message;
	
	@Persistent
	Boolean settled;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Date getDatetime() {
		return datetime;
	}

	public void setDatetime(Date datetime) {
		this.datetime = datetime;
	}

	public String getUser() {
		return user;
	}

	public void setUser(String user) {
		this.user = user;
	}

	public String getOriginUser() {
		return originUser;
	}

	public void setOriginUser(String originUser) {
		this.originUser = originUser;
	}

	public UserNotificationType getType() {
		return type;
	}

	public void setType(UserNotificationType type) {
		this.type = type;
	}

	public Long getProject() {
		return project;
	}

	public void setProject(Long project) {
		this.project = project;
	}

	
	
	public String getSubject() {
		return subject;
	}

	public void setSubject(String subject) {
		this.subject = subject;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public Boolean getSettled() {
		return settled;
	}

	public void setSettled(Boolean settled) {
		this.settled = settled;
	}
	
	
	
	
}
