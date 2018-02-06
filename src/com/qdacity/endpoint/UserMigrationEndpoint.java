package com.qdacity.endpoint;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.concurrent.Future;

import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import javax.persistence.EntityExistsException;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.config.Named;
import com.google.api.server.spi.response.ConflictException;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.qdacity.Cache;
import com.qdacity.Constants;
import com.qdacity.PMF;
import com.qdacity.authentication.AuthenticatedUser;
import com.qdacity.authentication.GoogleIdTokenValidator;
import com.qdacity.user.LoginProviderType;
import com.qdacity.user.User;
import com.qdacity.user.UserLoginProviderInformation;
import com.qdacity.user.UserType;
import com.qdacity.Authorization;

import com.qdacity.maintenance.tasks.v9tov10Migration.V9toV10MigrationUser;
import com.google.appengine.api.taskqueue.Queue;
import com.google.appengine.api.taskqueue.QueueFactory;
import com.google.appengine.api.taskqueue.TaskHandle;


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
	 * Adds the attribute authenticationProvider to all users, if they don't already have it
	 * This method is here and not in DataMigrationEndpoint because it needs the old authentication method
	 *
	 * @param user the admin triggering the endpoint
	 * @throws UnauthorizedException if the old user does not exist, or is not ADMIN
	 */
	@ApiMethod(
			name = "migration.migrateV9toV10",
			scopes = { Constants.EMAIL_SCOPE },
			clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
			audiences = { Constants.WEB_CLIENT_ID })
	public void migrateV9toV10(com.google.appengine.api.users.User user) throws UnauthorizedException {

		if(user == null) {
			throw new UnauthorizedException("Not a valid user");
		}

		//Check if user is admin
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		Key key = KeyFactory.createKey("User", user.getUserId());
		// check if current user exists and is ADMIN
		try{
			Entity userEntity = datastore.get(key);
			String userType = (String)userEntity.getProperty("type");
			if (!userType.equals("ADMIN")){
				throw new UnauthorizedException("Only Admins are authorized to trigger this endpoint, and the requester's status is "+ userType);
			}
		} catch (EntityNotFoundException e){
			throw new UnauthorizedException("User is not registered");
		}


		//get queue for data migration
		Queue taskQueue = QueueFactory.getQueue("DataMigrationQueue");
		List<Future<TaskHandle>> futures = new ArrayList<>();
		// User migration task which adds the attribute if not existing
		V9toV10MigrationUser updateTask = new V9toV10MigrationUser();
		// push to queue
		futures.add(taskQueue.addAsync(com.google.appengine.api.taskqueue.TaskOptions.Builder.withPayload(updateTask)));
	}


	/**
	 * Migrates a user from an old Google (Identity / Appengine) account to a "normal" Google account.
	 * The userId in persistence stays the same!
	 * @param oldUser
	 * @param idToken
	 * @throws UnauthorizedException if the old user does not exist
	 * @throws ConflictException if the old user is already migrated or the new user does already exist.
	 */
	@ApiMethod(
			name = "migrateFromGoogleIdentityToCustomAuthentication",
			scopes = { Constants.EMAIL_SCOPE },
			clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
			audiences = { Constants.WEB_CLIENT_ID })
	public void migrateFromGoogleIdentityToCustomAuthentication(com.google.appengine.api.users.User oldUser, @Named("idToken") String idToken) throws UnauthorizedException, ConflictException {

		if(oldUser == null) {
			throw new UnauthorizedException("The token for the current user could not be validated.");
		}
		AuthenticatedUser newUser = new GoogleIdTokenValidator().validate(idToken);
		if(newUser == null) {
			throw new UnauthorizedException("The token for the new user could not be validated.");
		}
		this.doMigrateFromGoogleIdentityToCustomAuthentication(oldUser, newUser);
	}


	/**
	 * Exists just for testing issues.
	 * Inserts old user into db.
	 * @param user
	 * @param loggedInUser
	 * @return
	 * @throws UnauthorizedException
	 */
	@ApiMethod(
			name = "insertOldUserForTesting",
			scopes = { Constants.EMAIL_SCOPE },
			clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
			audiences = { Constants.WEB_CLIENT_ID })
	public User insertOldUser(User user, com.google.appengine.api.users.User loggedInUser) throws UnauthorizedException {

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
			if (containsUser(user.getId())) {
				throw new EntityExistsException("User with id +" + user.getId() + "+ already exists");
			}
			mgr.makePersistent(user);
		} finally {
			mgr.close();
		}
		return user;
	}

	@ApiMethod(
			name = "isOldUserRegistered",
			scopes = { Constants.EMAIL_SCOPE },
			clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
			audiences = { Constants.WEB_CLIENT_ID })
	public BooleanWrapper isOldUserRegistered(com.google.appengine.api.users.User loggedInUser) throws UnauthorizedException {
		if(loggedInUser == null) {
			throw new UnauthorizedException("The User could not be authenticated");
		}
		return new BooleanWrapper(this.containsUser(loggedInUser.getUserId()));
	}

	private boolean containsUser(String id) {
		PersistenceManager mgr = getPersistenceManager();
		boolean contains = true;
		try {
			mgr.getObjectById(User.class, id);
		} catch (javax.jdo.JDOObjectNotFoundException ex) {
			contains = false;
		} finally {
			mgr.close();
		}
		return contains;
	}

	/**
	 * Migrates old user to new user.
	 * Therefore the user id stays the same.
	 * The new userId from the new login process is put into the UserLoginProviderInformation of the user.
	 * @param oldUser
	 * @param newUser
	 * @throws UnauthorizedException if the old user does not exist
	 * @throws ConflictException if the old user is already migrated or the new user does already exist.
	 */
	protected void doMigrateFromGoogleIdentityToCustomAuthentication(com.google.appengine.api.users.User oldUser, AuthenticatedUser newUser) throws UnauthorizedException, ConflictException {
		java.util.logging.Logger.getLogger("logger").log(Level.INFO, "Trying to migrate user with old id: " + oldUser.getUserId());
		java.util.logging.Logger.getLogger("logger").log(Level.INFO, "to user with id: " + newUser.getId() + " and provider: " + newUser.getProvider());


		// pre: oldUser must exist in db -> user-id == oldUser.userId
		User dbUser = fetchOldUser(oldUser);
		if(dbUser == null) {
			java.util.logging.Logger.getLogger("logger").log(Level.INFO, "Couldn't fetch the old user!");
			throw new UnauthorizedException("The old user does not exist!");
		}

		// pre: oldUser must not migrated be yet -> User with id == oldUser.userId must not have fields in UserLoginProviderInformation.
		if(hasLoginProviderInformation(dbUser)) {
			java.util.logging.Logger.getLogger("logger").log(Level.INFO, "There are already connected login provider information:");
			for(UserLoginProviderInformation info: dbUser.getLoginProviderInformation()) {
				java.util.logging.Logger.getLogger("logger").log(Level.INFO, "Provider information: " + info.getExternalUserId() + " with " + info.getProvider());
			}
			throw new ConflictException("The user seems to be already migrated!");
		}

		// pre: newUser must not exist in db -> newUser.id not in UserLoginProviderInformation.
		if(existsNewUser(newUser.getId(), newUser.getProvider())) {
			java.util.logging.Logger.getLogger("logger").log(Level.INFO, "There already exists a uer with the new ID!");
			throw new ConflictException("The new user already exists!");
		}

		// ready for migration:
			// add the newUser to UserLoginProivderInformation.
		dbUser.addLoginProviderInformation(new UserLoginProviderInformation(newUser.getProvider(), newUser.getId()));
		persistUpdatedUser(dbUser, newUser);
		java.util.logging.Logger.getLogger("logger").log(Level.INFO, "Migration was successful!");
	}

	private User fetchOldUser(com.google.appengine.api.users.User oldUser) {
		PersistenceManager mgr = getPersistenceManager();
		mgr.setIgnoreCache(true);
		try {
			User dbUser = mgr.getObjectById(User.class, oldUser.getUserId());
			java.util.logging.Logger.getLogger("logger").log(Level.INFO, "Fetched old user with id " + dbUser.getId() + " and " + dbUser.getLoginProviderInformation() + " connected login providers");
			dbUser = mgr.detachCopy(dbUser);
			return dbUser;
		} catch (javax.jdo.JDOObjectNotFoundException ex) {
			return null;
		} finally {
			mgr.close();
		}
	}

	private boolean existsNewUser(String userId, LoginProviderType providerType) {
		PersistenceManager mgr = getPersistenceManager();
		boolean exists = false;
		try {
			Query query = mgr.newQuery(UserLoginProviderInformation.class, "externalUserId == :externalUserId  && provider == :provider");
			Map<String, String> params = new HashMap<String, String>();
			params.put("externalUserId", userId);
			params.put("provider", providerType.toString());

			query.executeWithMap(params);

			List<UserLoginProviderInformation> results = (List<UserLoginProviderInformation>) query.executeWithMap(params);

			if(!results.isEmpty()) {
				exists = true;
			}
		} catch (javax.jdo.JDOObjectNotFoundException ex) {
			exists = false;
		} finally {
			mgr.close();
		}
		return exists;
	}

	private boolean hasLoginProviderInformation(User user) {
		if(user.getLoginProviderInformation().isEmpty()) {
			return false;
		} else {
			return true;
		}
	}

	private void persistUpdatedUser(User user, AuthenticatedUser authenticatedUser) {
		PersistenceManager mgr = getPersistenceManager();
		try{
			mgr.makePersistent(user);
			Cache.cache(user.getId(), User.class, user);
			Cache.cacheAuthenticatedUser(authenticatedUser, user); // also cache external user id
		} finally {
			mgr.close();
		}
	}


	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}

	public class BooleanWrapper {
		public boolean value;

		BooleanWrapper(boolean value) {
			this.value = value;
		}

		BooleanWrapper()	{ }
	}
}
