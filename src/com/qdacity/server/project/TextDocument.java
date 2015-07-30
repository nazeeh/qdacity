package com.qdacity.server.project;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;


@PersistenceCapable(identityType = IdentityType.APPLICATION)
public class TextDocument {
@Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
@PrimaryKey
Long id;

@Persistent
Long projectID;

@Persistent
String title;
@Persistent
String text;

public Long getId() {
	return id;
}
public void setId(Long id) {
	this.id = id;
}
public String getTitle() {
	return title;
}
public void setTitle(String title) {
	this.title = title;
}
public String getText() {
	return text;
}
public void setText(String text) {
	this.text = text;
}
public Long getProjectID() {
	return projectID;
}
public void setProjectID(Long projectID) {
	this.projectID = projectID;
}


}
