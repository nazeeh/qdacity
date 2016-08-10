package com.qdacity.server.project;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import com.google.appengine.api.datastore.Text;


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
Text text;

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
public Text getText() {
	return text;
}
public void setText(Text text) {
	this.text = text;
}
public Long getProjectID() {
	return projectID;
}
public void setProjectID(Long projectID) {
	this.projectID = projectID;
}






}
