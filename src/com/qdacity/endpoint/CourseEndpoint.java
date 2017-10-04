package com.qdacity.endpoint;

import java.util.Arrays;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.annotation.Nullable;
import javax.inject.Named;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import javax.persistence.EntityExistsException;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.response.CollectionResponse;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.memcache.MemcacheService;
import com.google.appengine.api.taskqueue.Queue;
import com.google.appengine.api.taskqueue.QueueFactory;
import com.google.appengine.api.users.User;
import com.qdacity.Authorization;
import com.qdacity.Cache;
import com.qdacity.Constants;
import com.qdacity.PMF;
import com.qdacity.course.Course;
import com.qdacity.course.TermCourse;
import com.qdacity.course.tasks.LastCourseUsed;


@Api(name = "qdacity",
	version = Constants.VERSION,
	namespace = @ApiNamespace(ownerDomain = "qdacity.com",
		ownerName = "qdacity.com",
		packagePath = "server.project"))
public class CourseEndpoint {

	/**
	 * This method lists all the entities inserted in datastore.
	 * It uses HTTP GET method and paging support.
	 *
	 * @return A CollectionResponse class containing the list of all entities
	 *         persisted and a cursor to the next page.
	 * @throws UnauthorizedException
	 */
	@SuppressWarnings({ "unchecked", "unused" })
	@ApiMethod(name = "course.listCourse",
		path = "courses",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public CollectionResponse<Course> listCourse(@Nullable @Named("cursor") String cursorString, @Nullable @Named("limit") Integer limit, User user) throws UnauthorizedException {

		if (user == null) throw new UnauthorizedException("User not authorized"); // TODO currently no user is authorized to list all courses

		PersistenceManager mgr = null;
		List<Course> execute = null;

		try {
			mgr = getPersistenceManager();

			Query q = mgr.newQuery(Course.class, ":p.contains(owners)");

			execute = (List<Course>) q.execute(Arrays.asList(user.getUserId()));

			// Tight loop for fetching all entities from datastore and accomodate
			// for lazy fetch.
			for (Course obj : execute);
		} finally {
			mgr.close();
		}

		return CollectionResponse.<Course> builder().setItems(execute).setNextPageToken(cursorString).build();
	}
	
	
	/**
	 * This method removes the entity with primary key id.
	 * It uses HTTP DELETE method.
	 *
	 * @param id the primary key of the entity to be deleted.
	 * @throws UnauthorizedException
	 */
	@SuppressWarnings("unchecked")
	@ApiMethod(name = "course.removeCourse",
		 
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public void removeCourse(@Named("id") Long id, User user) throws UnauthorizedException {
		PersistenceManager mgr = getPersistenceManager();
		try {
			Course course = (Course) mgr.getObjectById(Course.class, id);

			// Check if user is authorized
			Authorization.checkAuthorizationCourse(course, user);

			List<String> userIDs = course.getOwners();

			
			for (String courseUserIDs : userIDs) {
				com.qdacity.user.User courseUser = mgr.getObjectById(com.qdacity.user.User.class, courseUserIDs);

				courseUser.removeCourseAuthorization(id);
				mgr.makePersistent(courseUser);

			}
			 
			// Finally remove the actual course
			mgr.deletePersistent(course);
		} finally {
			mgr.close();
		}
	}
	
	/**
	 * This inserts a new entity into App Engine datastore. If the entity already
	 * exists in the datastore, an exception is thrown.
	 * It uses HTTP POST method.
	 *
	 * @param course the entity to be inserted.
	 * @return The inserted entity.
	 * @throws UnauthorizedException
	 */
	@ApiMethod(name = "course.insertCourse",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public Course insertCourse(Course course, User user) throws UnauthorizedException {
		// Check if user is authorized
		//Authorization.checkAuthorizationCourse(course, user); // FIXME does not make sense for inserting new courses - only check if user is in DB already

		PersistenceManager mgr = getPersistenceManager();
		try {
			if (course.getId() != null) {
				if (containsCourse(course)) {
					throw new EntityExistsException("Object already exists");
				}
			}
			course.addOwner(user.getUserId());
			mgr.makePersistent(course);
			// Authorize User
			com.qdacity.user.User dbUser = mgr.getObjectById(com.qdacity.user.User.class, user.getUserId());
			dbUser.addCourseAuthorization(course.getId());
			Cache.cache(dbUser.getId(), com.qdacity.user.User.class, dbUser);
		} finally {
			mgr.close();
		}
		return course;
	}

	
	@ApiMethod(name = "course.removeUser",
			path = "course.removeUser",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public void removeUser(@Named("courseID") Long courseID, User user) throws UnauthorizedException {

		PersistenceManager mgr = getPersistenceManager();
		try {
			String userIdToRemove = "";

			
			userIdToRemove = user.getUserId();

			Course course = (Course) Cache.getOrLoad(courseID, Course.class);
			if (course != null) { // if false -> bug.
					course.removeUser(userIdToRemove);
					Cache.cache(courseID, Course.class, course);
					mgr.makePersistent(course);
			}

			com.qdacity.user.User dbUser = mgr.getObjectById(com.qdacity.user.User.class, userIdToRemove);
			dbUser.removeCourseAuthorization(courseID);
			mgr.makePersistent(dbUser);
			

		} finally {
			mgr.close();
		}
	}
	
	/**
	 * This method gets the entity having primary key id. It uses HTTP GET method.
	 *
	 * @param id the primary key of the java bean.
	 * @return The entity with primary key id.
	 * @throws UnauthorizedException
	 */
	@ApiMethod(name = "course.getCourse",
		path = "course",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public Course getCourse(@Named("id") Long id, User user) throws UnauthorizedException {
		PersistenceManager mgr = getPersistenceManager();
		Course course = null;
		try {
			java.util.logging.Logger.getLogger("logger").log(Level.INFO, " Getting Course " + id);

			Authorization.isUserNotNull(user);
			com.qdacity.user.User dbUser = mgr.getObjectById(com.qdacity.user.User.class, user.getUserId());

			if (dbUser.getLastCourseId() != id) { // Check if lastcourse property of user has to be updated
				LastCourseUsed task = new LastCourseUsed(dbUser, id);
				Queue queue = QueueFactory.getDefaultQueue();
				queue.add(com.google.appengine.api.taskqueue.TaskOptions.Builder.withPayload(task));
			}

			String keyString;
			MemcacheService syncCache;
			course = (Course) Cache.getOrLoad(id, Course.class);

		} finally {
			mgr.close();
		}
		return course;
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
	@ApiMethod(name = "course.listTermCourse",
		path = "listTermCourse",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public List<TermCourse> listTermCourse(@Named("CourseID") Long CourseID, User user) throws UnauthorizedException {

		if (user == null) throw new UnauthorizedException("User not authorized"); // TODO currently no user is authorized to list all courses

		PersistenceManager mgr = null;
		List<TermCourse> execute = null;

		try {
			mgr = getPersistenceManager();

			Query q = mgr.newQuery(TermCourse.class, ":p.contains(CourseID)");

			execute = (List<TermCourse>) q.execute(Arrays.asList(CourseID));

			// Tight loop for fetching all entities from datastore and accomodate
			// for lazy fetch.
			for (TermCourse obj : execute);
		} finally {
			mgr.close();
		}

		return execute;
	}
	
	/**
	 * This inserts a new instance of a course into App Engine datastore. If the entity already
	 * exists in the datastore, an exception is thrown.
	 * It uses HTTP POST method.
	 *
	 * @param termCourse, the entity to be inserted.
	 * @return The inserted entity.
	 * @throws UnauthorizedException
	 */
	@ApiMethod(name = "course.insertTermCourse",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public TermCourse insertTermCourse(@Named("CourseID") Long CourseID, @Nullable @Named ("courseTerm") String term, TermCourse termCourse, User user) throws UnauthorizedException {
		
		termCourse.setCourseTemplateID(CourseID);
		termCourse.setTerm(term);
		
		PersistenceManager mgr = getPersistenceManager();
		try {
			if (termCourse.getId() != null) {
				if (containsTermCourse(termCourse)) {
					throw new EntityExistsException("Object already exists");
				}
			}
			
			mgr.makePersistent(termCourse);
			
		} finally {
			mgr.close();
		}
		return termCourse;
	}
	
	private boolean containsCourse(Course course) {
		PersistenceManager mgr = getPersistenceManager();
		boolean contains = true;
		try {
			mgr.getObjectById(Course.class, course.getId());
		} catch (javax.jdo.JDOObjectNotFoundException ex) {
			contains = false;
		} finally {
			mgr.close();
		}
		return contains;
	}

	private boolean containsTermCourse(TermCourse termCourse) {
		PersistenceManager mgr = getPersistenceManager();
		boolean contains = true;
		try {
			mgr.getObjectById(TermCourse.class, termCourse.getId());
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
