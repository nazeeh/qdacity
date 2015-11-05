package com.qdacity.upload;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import com.google.appengine.api.datastore.Blob;

@PersistenceCapable(identityType = IdentityType.APPLICATION)

public class Upload {
	
	@PrimaryKey
	@Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
	Long id;
	@Persistent
	String fileName;
	@Persistent
	Long fileSize;
	@Persistent
	 Blob fileData;
	@Persistent
	 Long project;
	  
	public String getFileName() {
		return fileName;
	}
	public void setFileName(String fileName) {
		this.fileName = fileName;
	}
	public long getFileSize() {
		return fileSize;
	}
	public void setFileSize(long fileSize) {
		this.fileSize = fileSize;
	}
	public Blob getFileData() {
		return fileData;
	}
	public void setFileData(Blob fileData) {
		this.fileData = fileData;
	}
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public Long getProject() {
		return project;
	}
	public void setProject(Long project) {
		this.project = project;
	}  
	
	
	  
	 
}
