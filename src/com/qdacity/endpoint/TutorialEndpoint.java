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
import com.qdacity.tutorial.TutorialManager;
import com.qdacity.tutorial.TutorialOverview;
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
	TutorialManager tutorialManager=new TutorialManager(tutorialCreator);
	
	@ApiMethod(
			name = "tutorial.loadTutorialData",
			scopes = { Constants.EMAIL_SCOPE },
			clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
			audiences = { Constants.WEB_CLIENT_ID })
	public List<TutorialOverview> loadTutorialData(@Named("which") int which, User user) throws UnauthorizedException {

		if (user == null) throw new UnauthorizedException("User not authorized");
		Hashtable<Long,Hashtable<String, String>> result=new Hashtable<Long, Hashtable<String,String>>();		
		
		return tutorialManager.getUserSpecificOverviewData(user.getUserId());
	
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
