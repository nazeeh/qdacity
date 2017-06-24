package com.qdacity.logs;

import com.qdacity.project.ProjectType;
import com.qdacity.project.codesystem.Code;
import com.qdacity.project.codesystem.CodeBookEntry;
import com.qdacity.project.codesystem.CodeRelation;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * Simplifies the process of creating a Change object.
 */
public class ChangeBuilder {
    
    public Change makeInsertCodeChange(Long projectID, ProjectType projectTyp, String userID, Long codeId) {
	return new Change(now(), projectID, projectTyp, ChangeType.CREATED, userID, ChangeObject.CODE, codeId);
    }
    
    public Change makeAddRelationShipChange(CodeRelation relation, Long projectID, ProjectType projectTyp, String userID, Long codeId) {
	Change change = new Change(now(), projectID, projectTyp, ChangeType.CREATED, userID, ChangeObject.CODE_RELATIONSHIP, codeId);
	//TODO as JSON change.setNewValue(); //TODO wie als JSON?
	return change;
    }
    
    private static Date now() {
	return new Date(System.currentTimeMillis());
    }
    
    public Change makeUpdateCodeChange(Code oldCode, Code newCode, Long projectId, ProjectType projectType, String userId) {
	Change change = new Change(now(), projectId, projectType, ChangeType.MODIFIED, userId, ChangeObject.CODE, newCode.getId());
	
	Map<String, String[]> codeDiff = diffCode(oldCode, newCode);
	
	change.setOldValue(oldValuesToPseudeJson(codeDiff));
	change.setNewValue(newValuesToPseudoJson(codeDiff));
	
	return change;
	
    }
    
    private String oldValuesToPseudeJson(Map<String, String[]> codeDiff) {
	return indexValuesToPseudoJSON(codeDiff, 0);
    }
    
    private String newValuesToPseudoJson(Map<String, String[]> codeDiff) {
	return indexValuesToPseudoJSON(codeDiff, 1);
    }
    
    private String indexValuesToPseudoJSON(Map<String, String[]> codeDiff, int index) {
	StringBuilder sb = new StringBuilder();
	for (String attribute : codeDiff.keySet()) {
	    sb.append("{\"");
	    sb.append(attribute);
	    sb.append("\":\"");
	    sb.append(codeDiff.get(attribute)[index].replace("\"", "&quot;"));
	    sb.append("\"},");
	}
	return sb.toString();
    }

    /**
     * creats a Map which contains the attribute name and an array with the old
     * an new value. old value has array index 0, new value has array index 1
     * Does not diff CodeBookEntry or Relationship changes!
     *
     * @param oldCode the old code
     * @param newCode the new code
     * @return Map only containing attributes that changed with their old and
     * new values
     */
    private Map<String, String[]> diffCode(Code oldCode, Code newCode) {
	Map<String, String[]> differences = new HashMap<>();
	
	ifNotEqualPutToDiff(oldCode.getAuthor(), newCode.getAuthor(), differences, "author"); //TODO namen auslagern!
	ifNotEqualPutToDiff(oldCode.getColor(), newCode.getColor(), differences, "color");
	ifNotEqualPutToDiff(oldCode.getMemo(), newCode.getMemo(), differences, "memo");
	ifNotEqualPutToDiff(oldCode.getName(), newCode.getName(), differences, "name");
	
	return differences;
    }
    
    private void ifNotEqualPutToDiff(String oldValue, String newValue, Map<String, String[]> differences, String name) {
	boolean changed = false;
	if ((oldValue == null && newValue != null) || (oldValue != null && newValue == null)) {
	    changed = true;
	} else if (oldValue != null && newValue != null) {
	    if (!oldValue.equals(newValue)) {
		changed = true;
	    }
	}
	if (changed) {
	    String[] values = {oldValue, newValue};
	    differences.put(name, values);
	}
    }

    /**
     * Creates a CodeBookEntry change for a Code Hint: As a CodeBookEntry only
     * makes sense for a Code we save the codeId of this change and not the
     * codebookEntryId!
     *
     * @param oldCodeBookEntry
     * @param newCodeBookEntry
     * @param projectId
     * @param projectType
     * @param userId
     * @param codeId
     * @return
     */
    public Change makeUpdateCodeBookEntryChange(CodeBookEntry oldCodeBookEntry, CodeBookEntry newCodeBookEntry, Long projectId, ProjectType projectType, String userId, Long codeId) {
	Change change = new Change(now(), projectId, projectType, ChangeType.MODIFIED, userId, ChangeObject.CODEBOOK_ENTRY, codeId);
	Map<String, String[]> differences = diffCodeBookEntry(oldCodeBookEntry, newCodeBookEntry);
	//TODO Test
	change.setOldValue(oldValuesToPseudeJson(differences));
	change.setNewValue(newValuesToPseudoJson(differences));
	
	return change;
    }
    
    private Map<String, String[]> diffCodeBookEntry(CodeBookEntry oldCodeBookEntry, CodeBookEntry newCodeBookEntry) {
	Map<String, String[]> differences = new HashMap<>();
	CodeBookEntry oldEntryToCheck = nullSafeCodeBookEntry(oldCodeBookEntry);
	CodeBookEntry newEntryToCheck = nullSafeCodeBookEntry(newCodeBookEntry);
	ifNotEqualPutToDiff(oldEntryToCheck.getDefinition(), newEntryToCheck.getDefinition(), differences, "definition");
	ifNotEqualPutToDiff(oldEntryToCheck.getExample(), newEntryToCheck.getExample(), differences, "example");
	ifNotEqualPutToDiff(oldEntryToCheck.getShortDefinition(), newEntryToCheck.getShortDefinition(), differences, "shortDefinition");
	ifNotEqualPutToDiff(oldEntryToCheck.getWhenNotToUse(), newEntryToCheck.getWhenNotToUse(), differences, "whenNotToUse");
	ifNotEqualPutToDiff(oldEntryToCheck.getWhenToUse(), newEntryToCheck.getWhenToUse(), differences, "whenToUse");
	
	return differences;
    }
    
    private CodeBookEntry nullSafeCodeBookEntry(CodeBookEntry cEntry) {
	CodeBookEntry entryToCheck = cEntry;
	if (entryToCheck == null) {
	    entryToCheck = new CodeBookEntry();
	    entryToCheck.setDefinition(null);
	    entryToCheck.setExample(null);
	    entryToCheck.setShortDefinition(null);
	    entryToCheck.setWhenNotToUse(null);
	    entryToCheck.setWhenToUse(null);
	}
	return entryToCheck;
    }
    
}
