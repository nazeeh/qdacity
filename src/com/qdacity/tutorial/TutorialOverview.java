package com.qdacity.tutorial;

import javax.jdo.annotations.Persistent;


public class TutorialOverview {
	
	@Persistent
	private long tutorialUnitId;
	
	@Persistent
	private String title;
	
	@Persistent
	private String descriptionTextShort;
	
	@Persistent
	private String descriptionTextLong;
	
	@Persistent
	private int maxSteps;
	
	@Persistent
	private int finishedRelative;
	
	@Persistent
	private String finishedAt;

	
	
	public long getTutorialUnitId() {
		return tutorialUnitId;
	}	

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public void setTutorialUnitId(long tutorialUnitId) {
		this.tutorialUnitId = tutorialUnitId;
	}

	public String getDescriptionTextShort() {
		return descriptionTextShort;
	}

	public void setDescriptionTextShort(String descriptionTextShort) {
		this.descriptionTextShort = descriptionTextShort;
	}

	public String getDescriptionTextLong() {
		return descriptionTextLong;
	}

	public void setDescriptionTextLong(String descriptionTextLong) {
		this.descriptionTextLong = descriptionTextLong;
	}

	public int getMaxSteps() {
		return maxSteps;
	}

	public void setMaxSteps(int maxSteps) {
		this.maxSteps = maxSteps;
	}

	public int getFinishedRelative() {
		return finishedRelative;
	}

	public void setFinishedRelative(int finishedRelative) {
		this.finishedRelative = finishedRelative;
	}

	public String getFinishedAt() {
		return finishedAt;
	}

	public void setFinishedAt(String finishedAt2) {
		this.finishedAt = finishedAt2;
	}
	
	
	
	
	
}
