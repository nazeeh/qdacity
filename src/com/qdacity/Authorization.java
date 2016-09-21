package com.qdacity;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.jdo.PersistenceManager;
import javax.jdo.Query;

import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.users.User;
import com.qdacity.project.Project;
import com.qdacity.project.codesystem.Code;
import com.qdacity.project.codesystem.CodeSystem;
import com.qdacity.project.data.TextDocument;

public class Authorization {
	
	public static Boolean isUserAuthorized(User googleUser, Long projectID) throws UnauthorizedException {
		PersistenceManager mgr = getPersistenceManager();
		
		// Check if user is Authorized
		Query query = mgr.newQuery(Project.class);
		
		query.setFilter( "id == :theID");
		Map<String, Long> params = new HashMap();
		params.put("theID", projectID);
		
		List<Project> projects = (List<Project>) query.executeWithMap(params);
		if (projects.size() == 0){
			throw new UnauthorizedException("Project " + projectID + " was not found");
		}
		Project project = projects.get(0);
		if (project.getOwners().contains(googleUser.getUserId())) return true;

		return false;
	}

	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}
	
	
	public static void checkAuthorization(TextDocument textDocument, User user)
			throws UnauthorizedException {
		if (user == null) throw new UnauthorizedException("User is Not Valid");
		Boolean authorized = Authorization.isUserAuthorized(user, textDocument.getProjectID());
		if (!authorized) throw new UnauthorizedException("User is Not Authorized");
	}
	
	
	public static void checkAuthorization(Code code, User user)
			throws UnauthorizedException {
		
		PersistenceManager mgr = getPersistenceManager();
		try {
			
			CodeSystem cs = mgr.getObjectById(CodeSystem.class, code.getCodesystemID());
			

			Authorization.checkAuthorization(cs, user);
		
		} finally {
			mgr.close();
		}
	}

	public static void checkAuthorization(CodeSystem codesystem, User user)
			throws UnauthorizedException {
		Authorization.checkAuthorization(codesystem.getProject(), user);
	}

	
	public static void checkAuthorization(Project project, User user)
			throws UnauthorizedException {
		if (user == null) throw new UnauthorizedException("User is Not Valid");
		Boolean authorized = Authorization.isUserAuthorized(user, project.getId());
		if (!authorized) throw new UnauthorizedException("User is Not Authorized");
		
	}
	
	public static void checkAuthorization(Long projectID, User user)
			throws UnauthorizedException {
		if (user == null) throw new UnauthorizedException("User is Not Valid");
		Boolean authorized = Authorization.isUserAuthorized(user, projectID);
		if (!authorized) throw new UnauthorizedException("User is Not Authorized");
		
	}
	
	public static void checkAuthorization(com.qdacity.user.User userRequested, User userLoggedIn)
			throws UnauthorizedException {
		if (userLoggedIn == null) throw new UnauthorizedException("User is Not Valid");
		Boolean authorized = userLoggedIn.getUserId() == userRequested.getId();
		if (!authorized) throw new UnauthorizedException("User is Not Authorized");
		
	}

	
}
