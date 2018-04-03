package com.qdacity.exercise;

import java.util.ArrayList;
import java.util.List;

import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.Inheritance;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;

import com.qdacity.project.Project;
import com.qdacity.project.ProjectRevision;

@PersistenceCapable(
	identityType = IdentityType.APPLICATION)
@Inheritance(
	customStrategy = "complete-table")
public class ExerciseProject extends ProjectRevision {

	/**
	 * 
	 */
	private static final long serialVersionUID = 8799704365471391176L;
	@Persistent
	List<String> validationCoders;
	@Persistent
	Long revisionID;
	@Persistent
	double paragraphFMeasure;
	@Persistent
	String creatorName;
	@Persistent
	Long exerciseID;
	@Persistent
	Boolean isSnapshot;
	public ExerciseProject(Project prj, Long projectID, String comment) {
		super(prj, projectID, comment);
		// TODO Auto-generated constructor stub
	}

	public ExerciseProject(ProjectRevision prjRev) {
		super(prjRev);
		this.revisionID = prjRev.getId();
		// TODO Auto-generated constructor stub
	}

	public Long getRevisionID() {
		return revisionID;
	}

	public void setRevisionID(Long revisionID) {
		this.revisionID = revisionID;
	}
	
	public Long getExerciseID() {
		return exerciseID;
	}

	public void setExerciseID(Long exerciseID) {
		this.exerciseID = exerciseID;
	}

	public List<String> getValidationCoders() {
		return validationCoders;
	}

	public void setValidationCoders(List<String> validationCoders) {
		this.validationCoders = validationCoders;
	}

	public void addValidationCoder(String userID) {
		if (validationCoders == null) validationCoders = new ArrayList<String>();
		if (!validationCoders.contains(userID)) validationCoders.add(userID);
	}

	public void removeValidationCoder(String userID) {
		if (validationCoders == null) validationCoders = new ArrayList<String>();
		if (validationCoders.contains(userID)) validationCoders.remove(userID);
	}

	public double getParagraphFMeasure() {
		return paragraphFMeasure;
	}

	public void setParagraphFMeasure(double paragraphAgreement) {
		this.paragraphFMeasure = paragraphAgreement;
	}

	public String getCreatorName() {
		return creatorName;
	}

	public void setCreatorName(String creatorName) {
		this.creatorName = creatorName;
	}

	public Boolean getSnapshot() {
		return isSnapshot;
	}

	public void setSnapshot(Boolean isSnapshot) {
		this.isSnapshot = isSnapshot;
	}
}
