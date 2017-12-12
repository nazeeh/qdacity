package com.qdacity.endpoint;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Date;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Hashtable;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.inject.Named;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;

import com.qdacity.tutorial.TutorialCreator;
import com.qdacity.tutorial.TutorialLog;
import com.qdacity.tutorial.TutorialUnit;
import com.qdacity.tutorial.TutorialUserState;
import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.api.users.User;
import com.qdacity.Authorization;
import com.qdacity.Constants;
import com.qdacity.Credentials;
import com.qdacity.PMF;
import com.qdacity.Sendgrid;
import com.qdacity.admin.AdminStats;
import com.qdacity.project.codesystem.Code;
import com.qdacity.project.saturation.SaturationResult;
import com.qdacity.util.DataStoreUtil;

@Api(
	name = "qdacity",
	version = Constants.VERSION,
	namespace = @ApiNamespace(
		ownerDomain = "qdacity.com",
		ownerName = "qdacity.com",
		packagePath = "server.project"))
public class TutorialEndpoint {
	
	TutorialCreator tutorialCreator=new TutorialCreator();
	
	@ApiMethod(
			name = "tutorial.loadTutorialData",
			scopes = { Constants.EMAIL_SCOPE },
			clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
			audiences = { Constants.WEB_CLIENT_ID })
	public Hashtable<Long, Hashtable<String,String>> loadTutorialData(@Named("which") int which, User user) throws UnauthorizedException {

		if (user == null) throw new UnauthorizedException("User not authorized");
		Hashtable<Long,Hashtable<String, String>> result=new Hashtable<Long, Hashtable<String,String>>();
	
		PersistenceManager mgr = getPersistenceManager();
		try 
		{
			Enumeration<TutorialUnit> tutorialUnits = tutorialCreator.getTutorialUnits().elements();
			
			while(tutorialUnits.hasMoreElements())
			{
				
				TutorialUnit it= tutorialUnits.nextElement();
				
				Hashtable<String,String> innerResult=new Hashtable<String, String>();
				result.put(it.getId(), innerResult);				
				
				innerResult.put("tutorialUnitId",Long.toString(it.getId()));
				innerResult.put("descriptionTextShort",it.getDescriptionTextShort());
				innerResult.put("descriptionTextShort",it.getDescriptionTextLong());
				innerResult.put("maxSteps", Integer.toString(it.getMaxSteps()));

				Query query = mgr.newQuery(TutorialUserState.class);
				query.setFilter("relatedUserId == :userId && which == :whichx");
				
				Map<String, Object> paramValues = new HashMap<>();
				paramValues.put("userId", user.getUserId());
				paramValues.put("whichx", it.getId()); //TODO eventuell alle datensaetze von einem user aufeinmal fetchen und dann hier mappen, performance?
				
				List<TutorialUserState> tmp = (List<TutorialUserState>)query.executeWithMap(paramValues);
		
				//TODO der fehler liegt wohl nicht in tmp sondern allgemein im backend system
				TutorialUserState tutorialUserState=null;
				if((tmp!=null) && tmp.size()>0){tutorialUserState=tmp.get(0);}//TODO ist aktuell nur ne vereinfachte lsg
				
				String finishRelative="";
				String finishedAt="";	
				if(tutorialUserState !=null) {
					finishRelative=Integer.toString((int)((Math.round(tutorialUserState.getLastStep()*100/it.getMaxSteps()))));
					
					if(tutorialUserState.isComplete()) {
						finishedAt=Long.toString(tutorialUserState.getWhenLastStepFinish());
						finishRelative="100";
					}
					else {
						finishedAt="-1";
					}					
				}
				else {
					finishRelative="0";
					finishedAt="-1";			
				}
				
				innerResult.put("finishRelative", finishRelative);
				innerResult.put("finishedAt",finishedAt);				
			}

		}
		catch(Exception e) {
			result.clear();
			//TODO maybe pushing a error flag and optional a error-message out
		}
		finally {
			mgr.close();
		}		
	
		return result;
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
