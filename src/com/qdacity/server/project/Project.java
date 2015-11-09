package com.qdacity.server.project;

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
}
