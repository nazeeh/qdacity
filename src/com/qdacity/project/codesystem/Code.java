package com.qdacity.project.codesystem;

import java.util.ArrayList;
import java.util.List;

import javax.jdo.annotations.Column;
import javax.jdo.annotations.Element;
import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

@PersistenceCapable(
	identityType = IdentityType.APPLICATION)
public class Code {
	@PrimaryKey
	@Persistent(
		valueStrategy = IdGeneratorStrategy.IDENTITY)
	Long id;

	@Persistent
	Long codeID;
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
	Long codesystemID;
	@Persistent
	String memo;
	
	//Meta model element
	@Persistent
	Long mmElementID;
	
	@Persistent(
		defaultFetchGroup = "true",
		dependent = "true")
	@Column(
		name = "codeBookEntry")
	CodeBookEntry codeBookEntry;

	@Persistent(
		defaultFetchGroup = "true")
	@Element(
		dependent = "true")
	@Column(
		name = "relations")
	List<CodeRelation> relations;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getCodeID() {
		return codeID;
	}

	public void setCodeID(Long codeID) {
		this.codeID = codeID;
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

	public void addSubCodeID(Long id) {
		subCodeIDs.add(id);
	}

	public void removeSubCodeID(Long id) {
		subCodeIDs.remove(id);
	}

	public Long getParentID() {
		return parentID;
	}

	public void setParentID(Long parentCode) {
		this.parentID = parentCode;
	}

	public Long getCodesystemID() {
		return codesystemID;
	}

	public void setCodesystemID(Long codesystemID) {
		this.codesystemID = codesystemID;
	}

	public String getMemo() {
		return memo;
	}

	public void setMemo(String memo) {
		this.memo = memo;
	}

	public Long getMmElementID() {
		return mmElementID;
	}

	public void setMmElementID(Long mmElementID) {
		this.mmElementID = mmElementID;
	}

	public CodeBookEntry getCodeBookEntry() {
		return codeBookEntry;
	}

	public void setCodeBookEntry(CodeBookEntry codeBookEntry) {
		if (this.codeBookEntry == null) this.codeBookEntry = new CodeBookEntry();
		this.codeBookEntry.setDefinition(codeBookEntry.getDefinition());
		this.codeBookEntry.setExample(codeBookEntry.getExample());
		this.codeBookEntry.setShortDefinition(codeBookEntry.getShortDefinition());
		this.codeBookEntry.setWhenToUse(codeBookEntry.getWhenToUse());
		this.codeBookEntry.setWhenNotToUse(codeBookEntry.getWhenNotToUse());

	}

	public List<CodeRelation> getRelations() {
		return relations;
	}

	public void setRelations(List<CodeRelation> relations) {
		this.relations = relations;
	}

	public void addRelation(CodeRelation relation) {
		if (this.relations == null) this.relations = new ArrayList<CodeRelation>();
		this.relations.add(relation);

	}

	public void removeRelation(Long relationId) {
		if (this.relations == null) this.relations = new ArrayList<CodeRelation>();
		int index = -1;
		for (int i = 0; i < relations.size(); i++) {
			if (relations.get(i).getKey().getId() == relationId){
				relations.remove(i);
				break;
			}
		}
	}

}
