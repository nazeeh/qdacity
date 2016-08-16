package com.qdacity.logs;

import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.PrimaryKey;

@PersistenceCapable(identityType = IdentityType.APPLICATION)
public class ChangeStats {
	@PrimaryKey
	Long id;
	
	String label;
		
	int codesCreated;
	int codesDeleted;
	int codesModified;
	
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public int getCodesCreated() {
		return codesCreated;
	}
	public void setCodesCreated(int codesCreated) {
		this.codesCreated = codesCreated;
	}
	public int getCodesDeleted() {
		return codesDeleted;
	}
	public void setCodesDeleted(int codesDeleted) {
		this.codesDeleted = codesDeleted;
	}
	public int getCodesModified() {
		return codesModified;
	}
	public void setCodesModified(int codesModified) {
		this.codesModified = codesModified;
	}
	public String getLabel() {
		return label;
	}
	public void setLabel(String label) {
		this.label = label;
	}
	
	
	
	
	
}
