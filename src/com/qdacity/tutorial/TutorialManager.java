package com.qdacity.tutorial;

import java.lang.reflect.Array;
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
import com.qdacity.metamodel.MetaModelEntity;


public class TutorialManager {
	
	//TODO maybe DI?
	TutorialCreator tutorialCreator;
	
	private ArrayList<SystemTutorialUnit> cachedSystemTutorials=new ArrayList<SystemTutorialUnit>();
	//private PersistenceManager cachedPersistenceManager=null;
	
	public TutorialManager(TutorialCreator tutorialCreator) {	
		this.tutorialCreator=tutorialCreator;
	}
	
	

	
	public List<TutorialOverview> getUserSpecificOverviewData(String userId){
		
		List<TutorialOverview> tutorialOverviewList=new ArrayList<TutorialOverview>();
		
		PersistenceManager mgr = getPersistenceManager();
		try 
		{
			Hashtable<Long, TutorialUnit> tutorialUnits=new Hashtable<Long, TutorialUnit>();	
			
			this.createSystemTutorialsAndPushThemIntoDatabase();//TODO for testing/debugging purposes, remove it!

			ArrayList<SystemTutorialUnit> systemTutorialUnits=this.getAllSystemTutorials(false);
			List<Long> tutorialUnitsKeys = new ArrayList<Long>();
			for(SystemTutorialUnit row : systemTutorialUnits)
			{
				tutorialUnitsKeys.add(row.getId());
				tutorialUnits.put(row.getId(), row);
			}
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
			e.printStackTrace();
			tutorialOverviewList.clear();
			
		}
		finally {
			mgr.close();
		}		
	
		return tutorialOverviewList;
		
	}

	
	
	public void createSystemTutorialsAndPushThemIntoDatabase()
	{
		ArrayList<SystemTutorialUnit> systemTutorials = this.tutorialCreator.createSystemTutorials();
		
		 PersistenceManager mgr = getPersistenceManager();
		 try {
			 mgr.deletePersistentAll(this.getAllSystemTutorials(true,mgr));
			 mgr.makePersistentAll(systemTutorials);
			 this.cachedSystemTutorials.clear();//man koennte auch direkt auf systemTutorials setzen, ABER, so fehlen eventuell neu erstellte IDs
		 }
		 finally {
			mgr.close();
		}	
	}
	
	public ArrayList<SystemTutorialUnit> getAllSystemTutorials(boolean clearCache)
	{
		return this.getAllSystemTutorials(clearCache,null);
	}
	
	
	public ArrayList<SystemTutorialUnit> getAllSystemTutorials(boolean clearCache, PersistenceManager pm)
	{
		if(clearCache || this.cachedSystemTutorials.size()==0)
		{
			PersistenceManager mgr=(pm==null)?getPersistenceManager():pm;
			//PersistenceManager mgr = getPersistenceManager();
			List<SystemTutorialUnit> result=(List<SystemTutorialUnit>)(mgr.newQuery(SystemTutorialUnit.class).execute());
			this.cachedSystemTutorials.clear();
			this.cachedSystemTutorials.addAll(result);
			System.out.println(result);
			ArrayList<SystemTutorialUnit> tmp= new ArrayList<SystemTutorialUnit>();
			tmp.addAll(result);
			return tmp;
		}
		return this.cachedSystemTutorials;
		
		
	}
	
	
	 private PersistenceManager getPersistenceManager() {
		 /*if(this.cachedPersistenceManager==null) {
		 		 this.cachedPersistenceManager=PMF.get().getPersistenceManager();
		 	}
		 	return this.cachedPersistenceManager;
		 	*/
		 return PMF.get().getPersistenceManager();
		 
	 }

	 //return: timestamp in secounds since 01.01.1970
	 private long getTimeStamp()
	 {
		 return new Timestamp(System.currentTimeMillis()).getTime()/1000;		 
	 }	
	
	
}
