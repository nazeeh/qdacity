package com.qdacity.endpoint;

import java.util.ArrayList;
import java.util.Date;
import java.util.logging.Level;

import javax.jdo.PersistenceManager;
import javax.persistence.EntityExistsException;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.config.Named;
import com.google.api.server.spi.response.UnauthorizedException;
import com.qdacity.Constants;
import com.qdacity.PMF;
import com.qdacity.authentication.AuthenticatedUser;
import com.qdacity.authentication.GoogleIdTokenValidator;
import com.qdacity.user.User;
import com.qdacity.user.UserType;

/**
 * Endpoints for migrating Users from older state to latest state.
 */
@Api(
	name = "qdacityusermigration",
	version = Constants.VERSION,
	namespace = @ApiNamespace(
		ownerDomain = "qdacity.com",
		ownerName = "qdacity.com",
		packagePath = "server.project")
)
public class UserMigrationEndpoint {

	/**
	 * Migrates a user from an old Google (Identity / Appengine) account to a "normal" Google account.
	 * @param oldUser
	 * @param idToken
	 * @throws UnauthorizedException 
	 */
	@ApiMethod(
			name = "userMigration.migrateFromGoogleIdentityToCustomAuthentication",
			scopes = { Constants.EMAIL_SCOPE },
			clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
			audiences = { Constants.WEB_CLIENT_ID })
	public void migrateFromGoogleIdentityToCustomAuthentication(com.google.appengine.api.users.User oldUser, @Named("idToken") String idToken) throws UnauthorizedException {
		
		if(oldUser == null) {
			throw new UnauthorizedException("The token for the current user could not be validated.");
		}
		java.util.logging.Logger.getLogger("logger").log(Level.INFO, "old user id " + oldUser.getUserId());
		java.util.logging.Logger.getLogger("logger").log(Level.INFO, "old user email " + oldUser.getEmail());
		java.util.logging.Logger.getLogger("logger").log(Level.INFO, "old user federate id " + oldUser.getFederatedIdentity());
		AuthenticatedUser newUser = new GoogleIdTokenValidator().validate(idToken);
		if(newUser == null) {
			throw new UnauthorizedException("The token for the new user could not be validated.");
		}
		java.util.logging.Logger.getLogger("logger").log(Level.INFO, "new user id " + newUser.getId());
	}

	
	@ApiMethod(
			name = "insertOldUserForTesting",
			scopes = { Constants.EMAIL_SCOPE },
			clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
			audiences = { Constants.WEB_CLIENT_ID })
	public User insertUser(User user, com.google.appengine.api.users.User loggedInUser) throws UnauthorizedException {
		
		if(loggedInUser == null) {
			throw new UnauthorizedException("The User could not be authenticated");
		}
		
		user.setId(loggedInUser.getUserId());
		user.setProjects(new ArrayList<Long>());
		user.setCourses(new ArrayList<Long>());
		user.setType(UserType.USER);
		user.setLastLogin(new Date());
		PersistenceManager mgr = getPersistenceManager();
		try {
			if (user.getId() != null && containsUser(user)) {
				throw new EntityExistsException("Object already exists");
			}
			mgr.makePersistent(user);
		} finally {
			mgr.close();
		}
		return user;
	}
	private boolean containsUser(User user) {
		PersistenceManager mgr = getPersistenceManager();
		boolean contains = true;
		try {
			mgr.getObjectById(User.class, user.getId());
		} catch (javax.jdo.JDOObjectNotFoundException ex) {
			contains = false;
		} finally {
			mgr.close();
		}
		return contains;
	}


	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}
}
