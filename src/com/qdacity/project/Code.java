package com.qdacity.project;

import java.util.List;

import javax.jdo.annotations.Column;
import javax.jdo.annotations.Element;
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
	@Persistent(defaultFetchGroup="true", dependent = "true") 
	@Column(name="codeBookEntry")
	CodeBookEntry codeBookEntry;

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

	public void addSubCodeID(Long id){
		subCodeIDs.add(id);
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
	
	
}
