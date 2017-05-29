package com.qdacity;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;

import javax.jdo.PersistenceManager;
import javax.jdo.Query;

import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.users.User;
import com.qdacity.endpoint.UserEndpoint;
import com.qdacity.metamodel.MetaModelEntity;
import com.qdacity.metamodel.MetaModelRelation;
import com.qdacity.project.Project;
import com.qdacity.project.ValidationProject;
import com.qdacity.project.codesystem.Code;
import com.qdacity.project.codesystem.CodeSystem;
import com.qdacity.project.data.TextDocument;
import com.qdacity.user.UserType;

public class Authorization {

	private static UserEndpoint userEndpoint = new UserEndpoint();
	
	public static Boolean isUserAuthorized(User googleUser, Long projectID) throws UnauthorizedException {
		PersistenceManager mgr = getPersistenceManager();

		// Check if user is Authorized
		Query query = mgr.newQuery(Project.class);

		query.setFilter("id == :theID");
		Map<String, Long> params = new HashMap<String, Long>();
		params.put("theID", projectID);

		@SuppressWarnings("unchecked")
		List<Project> projects = (List<Project>) query.executeWithMap(params);

		if (projects.size() == 0) {
			throw new UnauthorizedException("Project " + projectID + " was not found");
		}
		Project project = projects.get(0);
		if (project.getOwners().contains(googleUser.getUserId())) return true;

		return false;
	}

	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}

	public static void checkAuthorization(TextDocument textDocument, User user) throws UnauthorizedException {
		if (user == null) throw new UnauthorizedException("User is Not Valid");

		Boolean authorized = Authorization.isUserAuthorized(user, textDocument.getProjectID());
		if (!authorized) throw new UnauthorizedException("User is Not Authorized");
	}

	public static void checkAuthorization(Code code, User user) throws UnauthorizedException {

		PersistenceManager mgr = getPersistenceManager();
		try {

			CodeSystem cs = mgr.getObjectById(CodeSystem.class, code.getCodesystemID());

			Authorization.checkAuthorization(cs, user);

		} finally {
			mgr.close();
		}
	}

	public static void checkAuthorization(CodeSystem codesystem, User user) throws UnauthorizedException {
		Authorization.checkAuthorization(codesystem.getProject(), user);
	}

	public static void checkAuthorization(Project project, User user) throws UnauthorizedException {
		if (user == null) throw new UnauthorizedException("User is Not Valid");
		Boolean authorized = Authorization.isUserAuthorized(user, project.getId());
		if (!authorized) throw new UnauthorizedException("User is Not Authorized");

	}

	public static void checkAuthorization(Long projectID, User user) throws UnauthorizedException {
		if (user == null) throw new UnauthorizedException("User is Not Valid");
		Boolean authorized = Authorization.isUserAuthorized(user, projectID) || isUserAdmin(user);
		if (!authorized) throw new UnauthorizedException("User is Not Authorized");

	}

	public static void checkAuthorization(com.qdacity.user.User userRequested, User userLoggedIn) throws UnauthorizedException {
		if (userLoggedIn == null) throw new UnauthorizedException("User is Not Valid");
		Boolean authorized = (userLoggedIn.getUserId().equals(userRequested.getId()));
		if (!authorized) throw new UnauthorizedException("User " + userLoggedIn.getUserId() + " is Not Authorized");

	}
	
	public static void checkAuthorization(MetaModelEntity metaModelEntity, User userLoggedIn) throws UnauthorizedException {
		if (userLoggedIn == null) throw new UnauthorizedException("User is Not Valid");

		Boolean allowed = isUserAdmin(userLoggedIn);

		if (!allowed) throw new UnauthorizedException("User is Not Authorized");
	}

	public static void checkAuthorization(MetaModelRelation metaModelRelation, User userLoggedIn) throws UnauthorizedException {
		if (userLoggedIn == null) throw new UnauthorizedException("User is Not Valid");

		Boolean allowed = isUserAdmin(userLoggedIn);

		if (!allowed) throw new UnauthorizedException("User is Not Authorized");
	}

	public static AuthorizationLevel checkAuthorization(ValidationProject project, com.qdacity.user.User user) throws UnauthorizedException {
		if (user == null) throw new UnauthorizedException("User is Not Valid");

		if (user.getType() == UserType.ADMIN) return AuthorizationLevel.ADMIN;

		Boolean isValidationCoder = project.getValidationCoders().indexOf(user.getId()) != -1;
		if (isValidationCoder) return AuthorizationLevel.VALIDATIONCODER;

		PersistenceManager mgr = getPersistenceManager();
		Project parentProject = (Project) Cache.getOrLoad(project.getProjectID(), Project.class);

		Boolean isProjectOwner = parentProject.getOwners().contains(user.getId());
		if (isProjectOwner) return AuthorizationLevel.CODER;
		java.util.logging.Logger.getLogger("logger").log(Level.INFO, user.getId() + " is not owner of project " + parentProject.getId());
		throw new UnauthorizedException("User is Not Authorized.");
	}
	
	private static Boolean isUserAdmin(User googleUser) throws UnauthorizedException{
		com.qdacity.user.User user = userEndpoint.getCurrentUser(googleUser);
		if (user.getType() == UserType.ADMIN) return true;
		return false;
	}

	public static void checkDatabaseInitalizationAuthorization(User userLoggedIn) throws UnauthorizedException {
		if (userLoggedIn == null) throw new UnauthorizedException("User is Not Valid");

		Boolean allowed = isUserAdmin(userLoggedIn);

		if (!allowed) throw new UnauthorizedException("User is Not Authorized");
	}

}
