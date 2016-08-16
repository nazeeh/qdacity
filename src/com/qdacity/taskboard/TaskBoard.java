package com.qdacity.taskboard;

import java.util.Date;
import java.util.List;

import javax.jdo.annotations.Element;
import javax.jdo.annotations.Embedded;
import javax.jdo.annotations.EmbeddedOnly;
import javax.jdo.annotations.FetchGroup;
import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;
import javax.persistence.CascadeType;
import javax.persistence.OneToMany;

import com.google.appengine.api.datastore.Key;

@PersistenceCapable(identityType = IdentityType.APPLICATION)
public class TaskBoard {
	@PrimaryKey
	@Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
	Long id;
	
	@Persistent(defaultFetchGroup="true") 
	@Element( dependent = "true")
	List<Task> todo;
	
	@Persistent(defaultFetchGroup="true") 
	@Element( dependent = "true")
	List<Task> inProgress;
	
	@Persistent(defaultFetchGroup="true") 
	@Element( dependent = "true")
	@OneToMany(mappedBy = "taskBoard", cascade = CascadeType.PERSIST)
	List<Task> done;

	
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public List<Task> getTodo() {
		return todo;
	}

	public void setTodo(List<Task> todo) {
		this.todo = todo;
	}

	public List<Task> getInProgress() {
		return inProgress;
	}

	public void setInProgress(List<Task> inProgress) {
		this.inProgress = inProgress;
	}

	public List<Task> getDone() {
		return done;
	}

	public void setDone(List<Task> done) {
		this.done = done;
	}
	
	
	
}
