package com.qdacity.project.codesystem;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import com.google.appengine.api.datastore.Key;

@PersistenceCapable(
	identityType = IdentityType.APPLICATION)
public class CodeBookEntry {
	@PrimaryKey
	@Persistent(
		valueStrategy = IdGeneratorStrategy.IDENTITY)
	private Key key;

	@Persistent(
		defaultFetchGroup = "true",
		dependent = "true")
	String definition;
	@Persistent(
		defaultFetchGroup = "true",
		dependent = "true")
	String shortDefinition;
	@Persistent(
		defaultFetchGroup = "true",
		dependent = "true")
	String whenToUse;
	@Persistent(
		defaultFetchGroup = "true",
		dependent = "true")
	String whenNotToUse;
	@Persistent(
		defaultFetchGroup = "true",
		dependent = "true")
	String example;

	public CodeBookEntry() {
		this.definition = "<div></div>";
		this.shortDefinition = "<div></div>";
		this.whenToUse = "<div></div>";
		this.whenNotToUse = "<div></div>";
		this.example = "<div></div>";
	}

	public String getDefinition() {
		return definition;
	}

	public void setDefinition(String definition) {
		this.definition = definition;
	}

	public String getShortDefinition() {
		return shortDefinition;
	}

	public void setShortDefinition(String shortDefinition) {
		this.shortDefinition = shortDefinition;
	}

	public String getWhenToUse() {
		return whenToUse;
	}

	public void setWhenToUse(String whenToUse) {
		this.whenToUse = whenToUse;
	}

	public String getWhenNotToUse() {
		return whenNotToUse;
	}

	public void setWhenNotToUse(String whenNotToUse) {
		this.whenNotToUse = whenNotToUse;
	}

	public String getExample() {
		return example;
	}

	public void setExample(String example) {
		this.example = example;
	}

}
