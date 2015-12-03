package com.qdacity.server.taskboard;

import java.util.Date;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import com.google.appengine.api.datastore.Key;

@PersistenceCapable(identityType = IdentityType.APPLICATION)
public class Task {

	@PrimaryKey
    @Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
    private Key key;


    @Persistent(defaultFetchGroup="true", dependent="true" )
	Date created;

    @Persistent(defaultFetchGroup="true", dependent="true" ) 
	int priority;

    @Persistent(defaultFetchGroup="true", dependent="true" ) 
	String text;
    
    @Persistent(defaultFetchGroup="true", dependent="true" ) 
    public TaskBoard taskBoard;
    
	public Date getCreated() {
		return created;
	}
	public void setCreated(Date created) {
		this.created = created;
	}
	public int getPriority() {
		return priority;
	}
	public void setPriority(int priority) {
		this.priority = priority;
	}
	public String getText() {
		return text;
	}
	public void setText(String text) {
		this.text = text;
	}
	public Key getKey() {
		return key;
	}
	public void setKey(Key key) {
		this.key = key;
	}
//	public TaskBoard getTaskBoard() {
//		return taskBoard;
//	}

	
	


	
	
    
	
}
