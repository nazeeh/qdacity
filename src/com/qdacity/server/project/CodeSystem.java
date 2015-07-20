package com.qdacity.server.project;

import java.util.ArrayList;
import java.util.List;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import com.google.appengine.datanucleus.annotations.Unowned;

@PersistenceCapable(identityType = IdentityType.APPLICATION)
public class CodeSystem {
@PrimaryKey
@Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
Long id;
@Persistent
List<Long> codeIDs = new  ArrayList<Long>();

public void removeCode(Long codeID){
	codeIDs.remove(codeID);

}

public void addCode(Long codeID){
	codeIDs.add(codeID);
}

public Long getId() {
	return id;
}

public void setId(Long id) {
	this.id = id;
}

public List<Long> getCodeIDs() {
	return codeIDs;
}

public void setCodeIDs(List<Long> codeIDs) {
	this.codeIDs = codeIDs;
}





}