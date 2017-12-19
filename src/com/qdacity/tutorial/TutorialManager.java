package com.qdacity.tutorial;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Hashtable;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.inject.Named;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;

import com.google.appengine.api.users.User;
import com.qdacity.PMF;


public class TutorialManager {
	
	//TODO maybe DI?
	TutorialCreator tutorialCreator;
	
	
	public TutorialManager(TutorialCreator tutorialCreator) {	
		this.tutorialCreator=tutorialCreator;
	}
	
	public List<TutorialOverview> getUserSpecificOverviewData(String userId){
		
		List<TutorialOverview> tutorialOverviewList=new ArrayList<TutorialOverview>();
		
		PersistenceManager mgr = getPersistenceManager();
		try 
		{
			Hashtable<Long, TutorialUnit> tutorialUnits=tutorialCreator.getTutorialUnits();		
			List<Long> tutorialUnitsKeys = Collections.list(tutorialUnits.keys());
			Collections.sort(tutorialUnitsKeys);
			Iterator<Long> tutorialUnitsKeysIterator = tutorialUnitsKeys.iterator();

			while(tutorialUnitsKeysIterator.hasNext())
			{
				
				TutorialUnit it= tutorialUnits.get(tutorialUnitsKeysIterator.next());
				
				TutorialOverview tutorialOverview=new TutorialOverview();
				tutorialOverviewList.add(tutorialOverview);
				
				tutorialOverview.setTutorialUnitId(it.getId());
				tutorialOverview.setTitle(it.getTitle());
				tutorialOverview.setDescriptionTextShort(it.getDescriptionTextShort());
				tutorialOverview.setDescriptionTextLong(it.getDescriptionTextLong());
				tutorialOverview.setMaxSteps(it.getMaxSteps());
				
				Query query = mgr.newQuery(TutorialUserState.class);
				query.setFilter("relatedUserId == :userId && which == :whichx");
				
				Map<String, Object> paramValues = new HashMap<>();
				paramValues.put("userId", userId);
				paramValues.put("whichx", it.getId()); //TODO eventuell alle datensaetze von einem user aufeinmal fetchen und dann hier mappen, performance?
				
				List<TutorialUserState> tmp = (List<TutorialUserState>)query.executeWithMap(paramValues);
		
				//TODO der fehler liegt wohl nicht in tmp sondern allgemein im backend system
				TutorialUserState tutorialUserState=null;
				if((tmp!=null) && tmp.size()>0){tutorialUserState=tmp.get(0);}//TODO ist aktuell nur ne vereinfachte lsg
				
				int finishRelative=0;
				String finishedAt="";	
				if(tutorialUserState !=null) {
					finishRelative=(int)((Math.round(tutorialUserState.getLastStep()*100/it.getMaxSteps())));
					
					if(tutorialUserState.isComplete()) {
						finishedAt=Long.toString(tutorialUserState.getWhenLastStepFinish());
						finishRelative=100;
					}
					else {
						finishedAt="-1";
					}					
				}
				else {
					finishRelative=0;
					finishedAt="-1";			
				}
				
				tutorialOverview.setFinishedRelative(finishRelative);
				tutorialOverview.setFinishedAt(finishedAt);
						
			}

		}
		catch(Exception e) {
			tutorialOverviewList.remove(tutorialOverviewList.size()-1);//remove current one
		}
		finally {
			mgr.close();
		}		
	
		return tutorialOverviewList;
		
	}
	
	
	public void createSystemTutorialsAndPushThemIntoDatabase()
	{
		Hashtable<Long, TutorialUnit> systemTutorials = this.tutorialCreator.createSystemTutorials();
		TutorialList tutorialList = new TutorialList();
		tutorialList.setAllTutorials(systemTutorials);
		
		 PersistenceManager mgr = getPersistenceManager();
		 mgr.makePersistent(tutorialList);
		
		
	}
	
	
	 private static PersistenceManager getPersistenceManager() {
			return PMF.get().getPersistenceManager();
	 }

	 //return: timestamp in secounds since 01.01.1970
	 private long getTimeStamp()
	 {
		 return new Timestamp(System.currentTimeMillis()).getTime()/1000;		 
	 }	
	
	
}
