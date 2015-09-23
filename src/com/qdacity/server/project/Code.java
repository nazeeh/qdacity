package com.qdacity.server.project;

import java.util.List;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

@PersistenceCapable(identityType = IdentityType.APPLICATION)
public class Code {
	@PrimaryKey
	@Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
	Long id;
	@Persistent
	String author;
	@Persistent
	String color;
	@Persistent
	String message;
	@Persistent
	List<Long> subCodeIDs;
	@Persistent
	Long parentID;
	@Persistent
	Long codesytemID;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getAuthor() {
		return author;
	}

	public void setAuthor(String author) {
		this.author = author;
	}
	
	

	public String getColor() {
		return color;
	}

	public void setColor(String color) {
		this.color = color;
	}

	public String getName() {
		return message;
	}

	public void setName(String message) {
		this.message = message;
	}

	
	public List<Long> getSubCodesIDs() {
		return subCodeIDs;
	}

	public void setSubCodesIDs(List<Long> subCodesIDs) {
		this.subCodeIDs = subCodesIDs;
	}

	public void addSubCodeID(Long ID){
		subCodeIDs.add(ID);
	}

	public Long getParentID() {
		return parentID;
	}

	public void setParentID(Long parentCode) {
		this.parentID = parentCode;
	}

	public Long getCodesytemID() {
		return codesytemID;
	}

	public void setCodesytemID(Long codesytemID) {
		this.codesytemID = codesytemID;
	}
	
	
}
