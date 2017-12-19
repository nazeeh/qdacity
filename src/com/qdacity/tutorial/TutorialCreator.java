package com.qdacity.tutorial;

import java.util.ArrayList;
import java.util.Hashtable;

import javax.jdo.PersistenceManager;

import com.qdacity.PMF;

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
		 PersistenceManager mgr = getPersistenceManager();
		//getLast object......
		//extract hashtable and set Hashtable here
		 
		 //for testing:
		 this.tutorialUnits=createSystemTutorials();
		 
	}
	
	
	public Hashtable<Long, TutorialUnit> createSystemTutorials()
	{
		//some common work
				Hashtable<Long, TutorialUnit> result=new Hashtable<Long, TutorialUnit>();
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
				
				//Tutorial Unit 1 Group BASIC | Basic Tutorial
				t=new TutorialUnit(1, TutorialGroup.BASIC, "Basic Tutorial");
				result.put(t.getId(), t);
				t.setDescriptionTextShort("A basic tutorial for basic things");
				t.setDescriptionTextLong("A basic tutorial for basic things and some more informations");
				t.setMaxSteps(7);
				
				
				//Tutorial Unit 2 Group BASIC | Basic Tutorial
				t=new TutorialUnit(2, TutorialGroup.BASIC, "Second Tutorial");
				result.put(t.getId(), t);
				t.setDescriptionTextShort("blub blab blub");
				t.setDescriptionTextLong("blub blab blub and one more blub");
				t.setMaxSteps(9);
				
				
				//Tutorial Unit 3 Group BASIC | Basic Tutorial
				t=new TutorialUnit(3, TutorialGroup.BASIC, "Third Tutorial");
				result.put(t.getId(), t);
				t.setDescriptionTextShort("hmmmm ok");
				t.setDescriptionTextLong("hmmmmmmmmmmmmmmm ok");
				t.setMaxSteps(5);
				
				return result;
	}
	
	

	public Hashtable<Long, TutorialUnit> getTutorialUnits() {
		return tutorialUnits;
	}
	
	 private static PersistenceManager getPersistenceManager() {
			return PMF.get().getPersistenceManager();
	 }
	
	
	
}
