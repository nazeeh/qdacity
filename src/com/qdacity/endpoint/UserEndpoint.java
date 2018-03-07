package com.qdacity.endpoint;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.annotation.Nullable;
import javax.inject.Named;
import javax.jdo.JDOObjectNotFoundException;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import javax.persistence.EntityExistsException;
import javax.persistence.EntityNotFoundException;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query.CompositeFilter;
import com.google.appengine.api.datastore.Query.CompositeFilterOperator;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.api.taskqueue.Queue;
import com.google.appengine.api.taskqueue.QueueFactory;
import com.qdacity.Authorization;
import com.qdacity.Cache;
import com.qdacity.Constants;
import com.qdacity.PMF;
import com.qdacity.authentication.AuthenticatedUser;
import com.qdacity.authentication.QdacityAuthenticator;
import com.qdacity.course.Course;
import com.qdacity.logs.Change;
import com.qdacity.logs.ChangeBuilder;
import com.qdacity.logs.ChangeLogger;
import com.qdacity.project.Project;
import com.qdacity.project.ValidationProject;
import com.qdacity.project.tasks.ProjectDataPreloader;
import com.qdacity.user.User;
import com.qdacity.user.UserLoginProviderInformation;
import com.qdacity.user.UserType;

@Api(
	name = "qdacity",
	version = Constants.VERSION,
	namespace = @ApiNamespace(
		ownerDomain = "qdacity.com",
		ownerName = "qdacity.com",
		packagePath = "server.project"),
	authenticators = {QdacityAuthenticator.class}
)
public class UserEndpoint {

	/**
	 * This method lists all the entities inserted in datastore.
	 * It uses HTTP GET method and paging support.
	 *
	 * @return A CollectionResponse class containing the list of all entities
	 *         persisted and a cursor to the next page.
	 * @throws UnauthorizedException
	 */
	@SuppressWarnings({ "unchecked", "unused" })
	@ApiMethod(name = "user.listUser",	path = "userlist")
	public List<User> listUser(@Nullable @Named("cursor") String cursorString, @Nullable @Named("limit") Integer limit, @Named("projectID") Long projectID, com.google.api.server.spi.auth.common.User user) throws UnauthorizedException {
		Project project = null;
		List<User> myusers = null;
		PersistenceManager mgr = getPersistenceManager();

		project = mgr.getObjectById(Project.class, projectID);
		Authorization.checkAuthorization(project, user);
		
		Query q = mgr.newQuery(User.class);
		myusers = (List<User>) q.execute(Arrays.asList());
		
		List<User> users = new ArrayList<User>();

		for (User currentUser : myusers) {
			User dbUser = new User();
			dbUser.setGivenName(currentUser.getGivenName());
			dbUser.setSurName(currentUser.getSurName());
			dbUser.setProjects(currentUser.getProjects());
			dbUser.setCourses(currentUser.getCourses());
			dbUser.setId(currentUser.getId());
			dbUser.setType(UserType.valueOf(currentUser.getType().toString()));

			if (currentUser.getProjects().contains(projectID)) {
				users.add(dbUser);
			}
		}

		return users;
	}
	
	/**
	 * This method lists all the entities inserted in datastore.
	 * It uses HTTP GET method and paging support.
	 *
	 * @return A CollectionResponse class containing the list of all entities
	 *         persisted and a cursor to the next page.
	 * @throws UnauthorizedException
	 */
	@SuppressWarnings({ "unchecked", "unused" })
	@ApiMethod(		name = "user.listUserByCourse",
		path = "userlistbycourse")
	public List<User> listUserByCourse(@Nullable @Named("cursor") String cursorString, @Nullable @Named("limit") Integer limit, @Named("courseID") Long courseID, com.google.api.server.spi.auth.common.User user) throws UnauthorizedException {

		Course course = null;
		List<User> myusers = null;
		PersistenceManager mgr = getPersistenceManager();

		course = mgr.getObjectById(Course.class, courseID);
		Authorization.checkAuthorizationCourse(course, user);
		
		Query q = mgr.newQuery(User.class, ":p.contains(courses)");
		List<User> users = (List<User>) q.execute(Arrays.asList(courseID));
		
		return users;
	}

	@SuppressWarnings({ "unchecked", "unused" })
	@ApiMethod(name = "user.findUsers", path = "userlist")
	public List<User> findUsers(@Nullable @Named("cursor") String cursorString, @Nullable @Named("limit") Integer limit, @Named("searchTerm") String searchTerm, com.google.api.server.spi.auth.common.User user) throws UnauthorizedException {

		// Authorization.checkAuthorization(projectID, user); //FIXME only ADMIN

		List<Filter> filterList = new ArrayList<Filter>();
		// Set filter
		filterList.add(new FilterPredicate("givenName", FilterOperator.EQUAL, searchTerm));
		filterList.add(new FilterPredicate("surName", FilterOperator.EQUAL, searchTerm));
		filterList.add(new FilterPredicate("email", FilterOperator.EQUAL, searchTerm));

		CompositeFilter compFilter = new CompositeFilter(CompositeFilterOperator.OR, filterList);

		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

		com.google.appengine.api.datastore.Query q = new com.google.appengine.api.datastore.Query("User").setFilter(compFilter);

		PreparedQuery pq = datastore.prepare(q);

		Calendar cal = Calendar.getInstance();

		Map<String, Integer> freq = new HashMap<String, Integer>();

		List<User> users = new ArrayList<User>();

		for (Entity result : pq.asIterable()) {
			User dbUser = new User();

			Logger.getLogger("logger").log(Level.INFO, "Found User: " + result.getKey().getName());
			dbUser.setId(result.getKey().getName());
			dbUser.setGivenName((String) result.getProperty("givenName"));
			dbUser.setSurName((String) result.getProperty("surName"));
			dbUser.setProjects((List<Long>) result.getProperty("projects"));
			dbUser.setCourses((List<Long>) result.getProperty("courses"));
			dbUser.setType(UserType.valueOf((String) result.getProperty("type")));
			dbUser.setEmail((String) result.getProperty("email"));

			users.add(dbUser);
		}

		return users;
	}

	@SuppressWarnings("unchecked")
	@ApiMethod(name = "user.listValidationCoders", path = "validationProject")
	public List<User> listValidationCoders(@Named("validationProject") Long projectID, com.google.api.server.spi.auth.common.User user) {
		List<User> users = new ArrayList<User>();
		PersistenceManager mgr = getPersistenceManager();
		try {
			ValidationProject project = mgr.getObjectById(ValidationProject.class, projectID);
			List<String> validationCoders = project.getValidationCoders();
			if (!validationCoders.isEmpty()) {
				Query userQuery = mgr.newQuery(User.class, ":p.contains(id)");

				users = (List<User>) userQuery.execute(validationCoders);
			}
		} finally {
			mgr.close();
		}

		return users;
	}

	/**
	 * This method gets the entity having primary key id. It uses HTTP GET method.
	 *
	 * @param id the primary key of the java bean.
	 * @return The entity with primary key id.
	 * @throws UnauthorizedException
	 */
	@ApiMethod(name = "getUser")
	public User getUser(@Named("id") String id, com.google.api.server.spi.auth.common.User loggedInUser) throws UnauthorizedException {

		User user = getUser(id);

		// Check if user is authorized
		Authorization.checkAuthorization(user, loggedInUser);

		return user;
	}



	@ApiMethod(name = "updateUserType")
	public User updateUserType(@Named("id") String id, @Named("type") String type, com.google.api.server.spi.auth.common.User loggedInUser) throws UnauthorizedException {
		PersistenceManager mgr = getPersistenceManager();
		User user = null;
		try {

			user = (User) Cache.getOrLoad(id, User.class);
			// FIXME Check if user is authorized
			Authorization.checkAuthorization(user, loggedInUser);

			switch (type) {
				case "ADMIN":
					user.setType(UserType.ADMIN);
					break;
				case "USER":
					user.setType(UserType.USER);
					break;
				default:
					break;
			}

			mgr.makePersistent(user);
			Cache.cache(id, User.class, user);
			AuthenticatedUser authenticatedUser = (AuthenticatedUser) loggedInUser;
			Cache.cacheAuthenticatedUser(authenticatedUser, user); // also cache external user id

		} finally {
			mgr.close();
		}
		return user;
	}

	/**
	 * Gets the current user by given Login Information.
	 * @param loggedInUser
	 * @return
	 * @throws UnauthorizedException
	 */
	@ApiMethod(name = "user.getCurrentUser")
	public User getCurrentUser(com.google.api.server.spi.auth.common.User loggedInUser) throws UnauthorizedException {
		return getUserByLoginProviderId(loggedInUser);
	}

	

	/**
	 * This inserts a new entity into App Engine datastore. If the entity already
	 * exists in the datastore, an exception is thrown.
	 * It uses HTTP POST method.
	 * Be sure that the authenticator injects an instance of AuthenticatedUser, otherwise an Exception is thrown.
	 *
	 * @param user the entity to be inserted.
	 * @return The inserted entity.
	 * @throws UnauthorizedException 
	 * @throws IllegalArgumentException if the loggedInUser is not an instance of AuthenticatedUser.
	 */
	@ApiMethod(name = "insertUser")
	public User insertUser(User user, com.google.api.server.spi.auth.common.User loggedInUser) throws UnauthorizedException {
		
		if(loggedInUser == null) {
			throw new UnauthorizedException("The User could not be authenticated");
		}
		if(!(loggedInUser instanceof AuthenticatedUser)) {
			throw new IllegalArgumentException("A User for registration must be an instance of com.qdacity.authentication.AuthenticatedUser!");
		}
		AuthenticatedUser authenticatedUser = (AuthenticatedUser) loggedInUser;
		
		user.setId(authenticatedUser.getId());
		user.setProjects(new ArrayList<Long>());
		user.setCourses(new ArrayList<Long>());
		user.setType(UserType.USER);
		user.setLastLogin(new Date());
		user.setLoginProviderInformation(Arrays.asList(new UserLoginProviderInformation(authenticatedUser.getProvider(), authenticatedUser.getId())));
		PersistenceManager mgr = getPersistenceManager();
		try {
			if (user.getId() != null && containsUser(user)) {
				throw new EntityExistsException("Object already exists");
			}
			mgr.makePersistent(user);
		} finally {
			mgr.close();
		}

		// Log change
		Change change = new ChangeBuilder().makeInsertUserChange(user);
		ChangeLogger.logChange(change);

		return user;
	}

	/**
	 * This method is used for updating an existing entity. If the entity does not
	 * exist in the datastore, an exception is thrown.
	 * It uses HTTP PUT method.
	 *
	 * @param user the entity to be updated.
	 * @return The updated entity.
	 * @throws UnauthorizedException
	 */
	// FIXME Possibly remove, or make secure.
	@ApiMethod(name = "updateUser")
	public User updateUser(User user, com.google.api.server.spi.auth.common.User loggedInUser) throws UnauthorizedException {
		// Check if user is authorized
		Authorization.checkAuthorization(user, loggedInUser);

		PersistenceManager mgr = getPersistenceManager();
		try {
			if (!containsUser(user)) {
				throw new EntityNotFoundException("Object does not exist");
			}
			mgr.makePersistent(user);
			Cache.cache(user.getId(), User.class, user);
			AuthenticatedUser authenticatedUser = (AuthenticatedUser) loggedInUser;
			Cache.cacheAuthenticatedUser(authenticatedUser, user); // also cache external user id
		} finally {
			mgr.close();
		}
		return user;
	}

	/**
	 * This method removes the entity with primary key id.
	 * It uses HTTP DELETE method.
	 *
	 * @param id the primary key of the entity to be deleted.
	 * @throws UnauthorizedException
	 */
	@ApiMethod(name = "removeUser")
	public void removeUser(@Named("id") String id, com.google.api.server.spi.auth.common.User loggedInUser) throws UnauthorizedException {
		PersistenceManager mgr = getPersistenceManager();
		try {
			User user = (User) Cache.getOrLoad(id, User.class, mgr);
			User myUser = user;
			System.out.println("This is the id " + user.getId());

			// Check if user is authorized
			Authorization.checkAuthorization(user, loggedInUser);
			mgr.deletePersistent(myUser);
		} finally {
			mgr.close();
		}
	}

	@SuppressWarnings("unchecked")
	private User getUser(String userId) throws UnauthorizedException {
		User user = null;
		try {

			user = (User) Cache.get(userId, User.class);

			if (user == null || user.getLastLogin() == null || ((new Date()).getTime() - user.getLastLogin().getTime() > 600000)) {
				
				PersistenceManager mgr = getPersistenceManager();
				try {
					// TODO: redo with DataStoreService
					user = mgr.getObjectById(User.class, userId);
					// detatch copy, otherwise referenced default fetched objects filled with nulls
					user = mgr.detachCopy(user);
			
					if (user.getLastLogin() == null || ((new Date()).getTime() - user.getLastLogin().getTime() > 600000)) {
						user.setLastLogin(new Date());
						mgr.makePersistent(user);
					}
				} finally {
					mgr.close();
				}
				Cache.cache(user.getId(), User.class, user);
				// not caching external user id because we don't know which the fetched user will take!
			}

			// PreLoad User Data
			if (user.getLastProjectId() != null && user.getLastProjectType() != null) {
				ProjectDataPreloader task = new ProjectDataPreloader(user.getLastProjectId(), user.getLastProjectType());
				Queue queue = QueueFactory.getQueue("PreloadQueue");
				queue.add(com.google.appengine.api.taskqueue.TaskOptions.Builder.withPayload(task));
			}

		} catch (JDOObjectNotFoundException e) {
			e.printStackTrace();
			throw new UnauthorizedException("User is not registered");

		}
		return user;
	}

	/**
	 * Gets the qdacity.User by the given authentication information.
	 * 
	 * @param loggedInUser
	 * @return
	 * @throws UnauthorizedException
	 *             if the loggedInUser is null or there was no user found.
	 * @throws IllegalArgumentException
	 *             if the user is not an instance of AuthenticatedUser
	 * @throws IllegalStateException
	 *             if there are inconsistencies in db: more than one user linked
	 *             with the given provider id
	 */
	@SuppressWarnings("unchecked")
	private User getUserByLoginProviderId(com.google.api.server.spi.auth.common.User loggedInUser)
			throws UnauthorizedException {

		if (loggedInUser == null) {
			throw new UnauthorizedException("The User could not be authenticated");
		}
		if (!(loggedInUser instanceof AuthenticatedUser)) {
			throw new IllegalArgumentException(
					"A User for registration must be an instance of com.qdacity.authentication.AuthenticatedUser!");
		}

		AuthenticatedUser authUser = (AuthenticatedUser) loggedInUser;

		PersistenceManager mgr = getPersistenceManager();
		try {

			// Set filter for UserLoginProviderInformation
			Filter externalUserIdFilter = new FilterPredicate("externalUserId", FilterOperator.EQUAL, authUser.getId());
			Filter providerFilter = new FilterPredicate("provider", FilterOperator.EQUAL, "GOOGLE");
			Filter filter = new CompositeFilter(CompositeFilterOperator.AND,
					Arrays.asList(externalUserIdFilter, providerFilter));

			com.google.appengine.api.datastore.Query q = new com.google.appengine.api.datastore.Query(
					"UserLoginProviderInformation").setFilter(filter);

			DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

			PreparedQuery pq = datastore.prepare(q);

			Entity providerInformationEntity = pq.asSingleEntity();
			
			if (providerInformationEntity == null) {
				throw new UnauthorizedException("User is not registered");
			}

			Key userKey = providerInformationEntity.getParent();

			User user = mgr.getObjectById(User.class, userKey.getName());

			// detatch copy, otherwise referenced default fetched objects filled with nulls
			user = mgr.detachCopy(user);
			return user;
		} finally {
			mgr.close();
		}
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
