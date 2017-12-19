package com.qdacity.tutorial;

import java.util.ArrayList;

import javax.jdo.annotations.Persistent;

public class TutorialUnit {
	
	long id;
	
	@Persistent
	String title="";
	
	@Persistent
	String descriptionTextShort="";
	
	@Persistent
	String descriptionTextLong="";
	
	@Persistent
	TutorialGroup inGroup=TutorialGroup.DEFAULT;	
	
	@Persistent
	int maxSteps=0; //cached value, cause it could be derived of calculation in lists
	
	@Persistent
	ArrayList<StepGroup> stepGroups=new ArrayList<StepGroup>(); //enthaelt dann die einzelnen Steps, die dann wiederum eventuell in ShortSteps unterteilt sind
	
	
	public TutorialUnit(long id, TutorialGroup inGroup, String title) {
		this.id=id;
		this.inGroup=inGroup;
		this.title=title;
	}

	public long getId() {
		return id;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
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
	
	public TutorialGroup getInGroup() {
		return inGroup;
	}

	public void setInGroup(TutorialGroup inGroup) {
		this.inGroup = inGroup;
	}

	public int getMaxSteps() {
		return maxSteps;
	}

	public void setMaxSteps(int maxSteps) {
		this.maxSteps = maxSteps;
	}

	public ArrayList<StepGroup> getStepGroups() {
		return stepGroups;
	}

	public void setStepGroups(ArrayList<StepGroup> stepGroups) {
		this.stepGroups = stepGroups;
	}

	public void setId(long id) {
		this.id = id;
	}
	
}
