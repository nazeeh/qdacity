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

	@Persistent
	Long positionInOrder;
	
	public AgreementMap(Long id, Long projectID, String title, String textValue, Long positionInOrder) {
		this.textDocumentID = id;
		this.projectID = projectID;
		this.title = title;
		this.text = new Text(textValue);
		this.positionInOrder = positionInOrder;
	}
	
	public Key getKey() {
		return key;
	}

	public void setKey(Key key) {
		this.key = key;
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

	public Long getPositionInOrder() {
		return positionInOrder;
	}

	public void setPositionInOrder(Long positionInOrder) {
		this.positionInOrder = positionInOrder;
	}
}
