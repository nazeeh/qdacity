package com.qdacity.tutorial;

import java.util.ArrayList;

public class TutorialUnit {
	
	long id;
	String title="";
	String descriptionTextShort="";
	String descriptionTextLong="";
	int belongsToGroupId=0; //Mal ne DesignFrage hier, mappen gegen Ids oder gegen pointer (java-referenzen), zirkulaere Abhaengikeiten, also wenn ic
							//also wenn ich bspw. irgendwo ne Klasse habe UnitContainer und die wiederum fuer jede Collection eine Gruppe
							//dann ist ja die Gruppe darueber schon definiert, wenn ich die Gruppeninformation dann hier in der Klasse benoetige
							//brauche ich ja nen "pointer" zurueck zum Unit-Container...... was ist hier best practice?
							//weitere Frage: ist das gutes Design wenn man viele Methoden hat, die immer StatusObjekte (Anemic-Domain-Objekte zurueckgeben?)
	
	int maxSteps=0; //cached value, cause it could be derived of calculation in lists
	
	//auch hier die Frage, eher auf pointer oder auf ids (int) mappen?
	//meiner meinung nach: vorteile von int-ids: man kann die daten besser von der persistenz trennen, nachteil: man muss einen Globalen-Service Fragen, die Referenz zu bekommen.
	//interessanter artikel, den ich dazu gefunden habe: http://enterprisecraftsmanship.com/2014/12/27/dont-use-ids-domain-entities/
	ArrayList<StepGroup> stepGroups=new ArrayList<StepGroup>(); //enthaelt dann die einzelnen Steps, die dann wiederum eventuell in ShortSteps unterteilt sind
	
	
	public TutorialUnit(long id, int belongsTogroupId, String title) {
		this.id=id;
		this.belongsToGroupId=belongsTogroupId;
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

	public int getBelongsToGroupId() {
		return belongsToGroupId;
	}

	public void setBelongsToGroupId(int belongsToGroupId) {
		this.belongsToGroupId = belongsToGroupId;
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
