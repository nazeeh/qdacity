package com.qdacity.server;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import javax.persistence.EntityExistsException;

import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.users.User;
import com.qdacity.server.project.Code;
import com.qdacity.server.project.CodeSystem;
import com.qdacity.server.project.CodeSystemEndpoint;
import com.qdacity.server.project.Project;
import com.qdacity.server.project.TextDocument;

public class Authorization {
	
	public static Boolean isUserAuthorized(User googleUser, Long projectID) throws UnauthorizedException {
		PersistenceManager mgr = getPersistenceManager();
		
		// Check if user is Authorized
		
		Query query = mgr.newQuery(com.qdacity.server.user.User.class);
		
		query.setFilter( "id == :theID");
		Map<String, String> params = new HashMap();
		params.put("theID", googleUser.getUserId());
		
		List<com.qdacity.server.user.User> users = (List<com.qdacity.server.user.User>) query.executeWithMap(params);
		if (users.size() == 0){
			throw new UnauthorizedException("User " +googleUser.getUserId() + " was not found");
		}
		com.qdacity.server.user.User user = users.get(0);
		if (user.getProjects().contains(projectID)) return true;
		
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
			
			CodeSystem cs = mgr.getObjectById(CodeSystem.class, code.getCodesytemID());
			

			Authorization.checkAuthorization(cs, user);
		
		} finally {
			mgr.close();
		}
	}

	public static void checkAuthorization(CodeSystem codesystem, User user)
			throws UnauthorizedException {
		Authorization.checkAuthorization(codesystem.getProject(), user);
	}

//	public static void checkAuthorization(Long codesystemID, User user)
//			throws UnauthorizedException {
//		
//		if (user == null) throw new UnauthorizedException("User is Not Valid");
//		
//		Long projectID = CodeSystemEndpoint.getProjectIdFromCodesystem(codesystemID);
//		Boolean authorized = isUserAuthorized(user, projectID);
//		if (!authorized) throw new UnauthorizedException("User is Not Authorized");
//	}
	
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
	
	public static void checkAuthorization(com.qdacity.server.user.User userRequested, User userLoggedIn)
			throws UnauthorizedException {
		if (userLoggedIn == null) throw new UnauthorizedException("User is Not Valid");
		Boolean authorized = userLoggedIn.getUserId() == userRequested.getId();
		if (!authorized) throw new UnauthorizedException("User is Not Authorized");
		
	}

	
}
