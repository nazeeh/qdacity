package com.qdacity.project.codesystem;

import javax.jdo.annotations.Column;
import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import com.google.appengine.api.datastore.Key;
import com.google.appengine.datanucleus.annotations.Unowned;

@PersistenceCapable(
	identityType = IdentityType.APPLICATION)
public class CodeRelation {
	@PrimaryKey
	@Persistent(
		valueStrategy = IdGeneratorStrategy.IDENTITY)
	private Key key;

	@Persistent(
		defaultFetchGroup = "true",
		dependent = "true")
	Long mmElementId;

	@Persistent(
		defaultFetchGroup = "true",
		dependent = "true")
	Long codeId;

	@Column(name = "relationshipCodeId")
	Long relationshipCodeId;

	public Key getKey() {
		return key;
	}

	public void setKey(Key key) {
		this.key = key;
	}

	public Long getMmElementId() {
		return mmElementId;
	}

	public void setMmElementId(Long mmElementId) {
		this.mmElementId = mmElementId;
	}

	public Long getCodeId() {
		return codeId;
	}

	public void setCodeId(Long codeId) {
		this.codeId = codeId;
	}

	public Long getRelationshipCodeId() {
		return relationshipCodeId;
	}

	public void setRelationshipCodeId(Long relationshipCodeId) {
		this.relationshipCodeId = relationshipCodeId;
	}
}
