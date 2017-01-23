package com.qdacity.project.data;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.Text;

@PersistenceCapable(
	identityType = IdentityType.APPLICATION)
public class AgreementMap {

	@PrimaryKey
	@Persistent(
		valueStrategy = IdGeneratorStrategy.IDENTITY)
	private Key key;

	@Persistent
	Long projectID;

	@Persistent
	String title;

	@Persistent
	Text text;

	@Persistent
	Long textDocumentID;

	public AgreementMap(Long id, Long projectID, String title, String textValue) {
		this.textDocumentID = id;
		this.projectID = projectID;
		this.title = title;
		this.text = new Text(textValue);
	}

	public Long getProjectID() {
		return projectID;
	}

	public void setProjectID(Long projectID) {
		this.projectID = projectID;
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

	public Long getTextDocumentID() {
		return textDocumentID;
	}

	public void setTextDocumentID(Long textDocumentID) {
		this.textDocumentID = textDocumentID;
	}

}
