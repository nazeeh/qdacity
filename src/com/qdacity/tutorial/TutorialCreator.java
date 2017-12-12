package com.qdacity.tutorial;

import java.util.ArrayList;
import java.util.Hashtable;

/**
 * 
 * A Class, where you can create specific TutorialUnits
 * If you want to create a new TutorialUnit, you only have to use this class here
 *
 */


public class TutorialCreator {

	Hashtable<Long, TutorialUnit> tutorialUnits=new Hashtable<Long, TutorialUnit>();
	
	public TutorialCreator()
	{
		//some common work
		TutorialUnit t;
		
		//Tutorial Unit 1 | Example Tutorial
		/**
		 * Description Text for programmers
		 */
		//t=new TutorialUnit(1);		
		//tutorialUnits.put(t.getId(), t);
		
		//TODO eventuell moeglichkeit fuer method-chaining und constructor initialisierung hinzufuegen
		
		/**
		 * 
		 * t.setPreferedUserType
		 * t.setAllowedUserType
		 * t.setDescriptionText
		 * t.setName
		 * t.set.....
		 * 
		 *  //parent class Step -> childClass (NormalStep) OR childClass (QuizStep) //JavaScript Analogum muss existieren
		 * tStep=new TutorialStep();
		 * tStep.setName
		 * tStep.setDescription
		 * tStep.setHint
		 * tStep.setRuleForFinishing
		 * t.addStep(tStep)
		 * 
		 * 
		 * 
		 */
		
		
		
		
		
		//Tutorial Unit N | Name
		//t=new TutorialUnit(-1);
		//tutorialUnits.put(t.getId(), t);
		
		
		
		//........
		
		//Tutorial Unit 1 Group 1 | Basic Tutorial
		t=new TutorialUnit(1,1, "Basic Tutorial");
		tutorialUnits.put(t.getId(), t);
		t.setDescriptionTextShort("A basic tutorial for basic things");
		t.setDescriptionTextLong("A basic tutorial for basic things and some more informations");
		t.setMaxSteps(7);
		
		
		
		
		
	}

	public Hashtable<Long, TutorialUnit> getTutorialUnits() {
		return tutorialUnits;
	}
	
	
	
}
