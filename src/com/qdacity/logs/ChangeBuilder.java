package com.qdacity.logs;

import com.qdacity.project.ProjectType;
import com.qdacity.project.codesystem.Code;
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

    private static Date now() {
	return new Date(System.currentTimeMillis());
    }

    public Change makeUpdateCodeChange(Code oldCode, Code newCode, Long projectId, ProjectType projectType, String userId) {
	Change change = new Change(now(), projectId, projectType, ChangeType.MODIFIED, userId, ChangeObject.CODE, newCode.getId());

	Map<String, String[]> codeDiff = diffCode(oldCode, newCode);

	change.setOldValue(oldValuestoJson(codeDiff));
	change.setNewValue(newValuesToJson(codeDiff));

	return change;

    }

    private String oldValuestoJson(Map<String, String[]> codeDiff) {
	return indexValuesToJson(codeDiff, 0);
    }

    private String newValuesToJson(Map<String, String[]> codeDiff) {
	return indexValuesToJson(codeDiff, 1);
    }

    private String indexValuesToJson(Map<String, String[]> codeDiff, int index) {
	StringBuilder sb = new StringBuilder();
	for (String attribute : codeDiff.keySet()) {
	    sb.append("\"");
	    sb.append(attribute);
	    sb.append("\":\"");
	    sb.append(codeDiff.get(attribute)[index]);
	    sb.append("\";");
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

}
