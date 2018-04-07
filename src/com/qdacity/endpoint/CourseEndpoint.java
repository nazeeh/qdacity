package com.qdacity.endpoint;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.logging.Level;

import javax.annotation.Nullable;
import javax.inject.Named;
import javax.jdo.JDOObjectNotFoundException;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import javax.persistence.EntityExistsException;

import com.google.api.server.spi.auth.common.User;
import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.response.CollectionResponse;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.taskqueue.Queue;
import com.google.appengine.api.taskqueue.QueueFactory;
import com.qdacity.Authorization;
import com.qdacity.Cache;
import com.qdacity.Constants;
import com.qdacity.PMF;
import com.qdacity.authentication.AuthenticatedUser;
import com.qdacity.authentication.QdacityAuthenticator;
import com.qdacity.course.Course;
import com.qdacity.course.TermCourse;
import com.qdacity.course.tasks.LastCourseUsed;
import com.qdacity.user.UserGroup;
import com.qdacity.user.UserNotification;
import com.qdacity.user.UserNotificationType;


@Api(name = "qdacity",
	version = Constants.VERSION,
	namespace = @ApiNamespace(ownerDomain = "qdacity.com",
		ownerName = "qdacity.com",
		packagePath = "server.project"),
	authenticators = {QdacityAuthenticator.class})
public class CourseEndpoint {

	private UserEndpoint userEndpoint = new UserEndpoint();

	/**
	 * This method lists all the entities inserted in datastore.
	 * It uses HTTP GET method and paging support.
	 *
	 * @return A CollectionResponse class containing the list of all entities
	 *         persisted and a cursor to the next page.
	 * @throws UnauthorizedException
	 */
	@SuppressWarnings({ "unchecked", "unused" })
	@ApiMethod(name = "course.listCourse", path = "courses")
	public CollectionResponse<Course> listCourse(@Nullable @Named("cursor") String cursorString, @Nullable @Named("limit") Integer limit, User user) throws UnauthorizedException {

		com.qdacity.user.User qdacityUser = userEndpoint.getCurrentUser(user); // also checks if user is registered

		if (user == null) throw new UnauthorizedException("User not authorized"); // TODO currently no user is authorized to list all courses

		return listCourseByUserId(cursorString, qdacityUser.getId());
	}

	@ApiMethod(name = "course.listByUserGroupId")
	public CollectionResponse<Course> listCourseByUserGroupId(@Nullable @Named("cursor") String cursorString, @Nullable @Named("limit") Integer limit,
															  @Named("userGroupId") Long userGroupId, User user) throws UnauthorizedException {

		UserGroup userGroup = (UserGroup) Cache.getOrLoad(userGroupId, UserGroup.class);
		com.qdacity.user.User requestingUser = userEndpoint.getCurrentUser(user);

		if(!userGroup.getParticipants().contains(requestingUser.getId())) { // allow participants of group
			Authorization.checkAuthorization(userGroup, user); // and owners and admins
		}

		List<Course> execute = null;
		PersistenceManager mgr = getPersistenceManager();
		try {
			Query q = mgr.newQuery(Course.class, ":p.contains(owningUserGroups)");
			execute = (List<Course>) q.execute(Arrays.asList(userGroupId));

			// Tight loop for fetching all entities from datastore and accomodate
			// for lazy fetch.
			for (Course obj : execute);
		} finally {
			mgr.close();
		}
		return CollectionResponse.<Course> builder().setItems(execute).setNextPageToken(cursorString).build();
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
	@ApiMethod(name = "course.listCourseByUserId", path = "courses.listByUser")
	public CollectionResponse<Course> listCourseByUserId(@Named("id") String userId, @Nullable @Named("cursor") String cursorString, @Nullable @Named("limit") Integer limit, User user) throws UnauthorizedException {

		com.qdacity.user.User requestedUser = (com.qdacity.user.User) Cache.getOrLoad(userId, com.qdacity.user.User.class);
		Authorization.checkAuthorization(requestedUser, user);

		return listCourseByUserId(cursorString, requestedUser.getId());
	}

	/**
	 * Fetches all courses linked to the given user id.
	 * Be sure to check authorization first!
	 * @param cursorString
	 * @param userId
	 * @return
	 */
	private CollectionResponse<Course> listCourseByUserId(@Nullable @Named("cursor") String cursorString, String userId) {
		PersistenceManager mgr = null;
		List<Course> execute = null;

		try {
			mgr = getPersistenceManager();

			Query q = mgr.newQuery(Course.class, ":p.contains(owners)");

			execute = (List<Course>) q.execute(Arrays.asList(userId));

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
	@ApiMethod(name = "course.removeCourse")
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

			// remove user groups
			for (Long userGroupId: course.getOwningUserGroups()) {
				UserGroup userGroup = (UserGroup) Cache.getOrLoad(userGroupId, UserGroup.class);
				userGroup.getProjects().remove(id);
				mgr.makePersistent(userGroup);
				Cache.cache(userGroupId, UserGroup.class, userGroup);
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
	@ApiMethod(name = "course.insertCourse")
	public Course insertCourse(Course course, User user) throws UnauthorizedException {

		com.qdacity.user.User qdacityUser = userEndpoint.getCurrentUser(user); // also checks if user is registered

		PersistenceManager mgr = getPersistenceManager();
		try {
			if (course.getId() != null) {
				if (containsCourse(course)) {
					throw new EntityExistsException("Course already exists");
				}
			}

			try {
				course.addOwner(qdacityUser.getId());
				mgr.makePersistent(course);
				// Authorize User
				Authorization.isUserRegistered(qdacityUser);
				qdacityUser.addCourseAuthorization(course.getId());
				mgr.makePersistent(qdacityUser);

				Cache.cache(qdacityUser.getId(), com.qdacity.user.User.class, qdacityUser);
				AuthenticatedUser authenticatedUser = (AuthenticatedUser) user;
				Cache.cacheAuthenticatedUser(authenticatedUser, qdacityUser); // also cache external user id
			}
			catch (javax.jdo.JDOObjectNotFoundException ex) {
				throw new javax.jdo.JDOObjectNotFoundException("User is not registered");
			}

		} finally {
			mgr.close();
		}
		return course;
	}

	@ApiMethod(name = "course.insertCourseForUserGroup")
	public Course insertCourseForUserGroup(Course course, @Named("userGroupId") Long userGroupId, User user) throws UnauthorizedException {

		com.qdacity.user.User qdacityUser = userEndpoint.getCurrentUser(user); // also checks if user is registered

		PersistenceManager mgr = getPersistenceManager();
		try {
			if (course.getId() != null) {
				if (containsCourse(course)) {
					throw new EntityExistsException("Course already exists");
				}
			}

			try {
				UserGroup userGroup = (UserGroup) Cache.getOrLoad(userGroupId, UserGroup.class);

				course.setOwningUserGroups(Arrays.asList(userGroupId));
				course = mgr.makePersistent(course);
				Cache.cache(course.getId(), Course.class, course);

				userGroup.getCourses().add(course.getId());
				mgr.makePersistent(userGroup);
				Cache.cache(userGroup.getId(), UserGroup.class, userGroup);
			}
			catch (javax.jdo.JDOObjectNotFoundException ex) {
				throw new javax.jdo.JDOObjectNotFoundException("User is not registered");
			}

		} finally {
			mgr.close();
		}
		return course;
	}


	@ApiMethod(name = "course.removeUser", path = "course.removeUser")
	public void removeUser(@Named("courseID") Long courseID, User user) throws UnauthorizedException {

		com.qdacity.user.User qdacityUser = userEndpoint.getCurrentUser(user); // also checks if user is registered

		PersistenceManager mgr = getPersistenceManager();
		try {
			String userIdToRemove = "";


			userIdToRemove = qdacityUser.getId();

			Course course = (Course) Cache.getOrLoad(courseID, Course.class);
			if (course != null) {
					course.removeUser(userIdToRemove);
					Cache.cache(courseID, Course.class, course);
					mgr.makePersistent(course);
			}
			else
			{
				throw new javax.jdo.JDOObjectNotFoundException("Course does not exist");
			}

			qdacityUser.removeCourseAuthorization(courseID);
			mgr.makePersistent(qdacityUser);


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
	@ApiMethod(name = "course.getCourse", path = "course")
	public Course getCourse(@Named("id") Long id, User user) throws UnauthorizedException {

		com.qdacity.user.User qdacityUser = userEndpoint.getCurrentUser(user); // also checks if user is registered

		PersistenceManager mgr = getPersistenceManager();
		Course course = null;
		try {
			course = (Course) mgr.getObjectById(Course.class, id);
		}
		catch (Exception e) {
			throw new javax.jdo.JDOObjectNotFoundException("Course does not exist");
		};

		try {
			java.util.logging.Logger.getLogger("logger").log(Level.INFO, " Getting Course " + id);

			// Check if user is registered
			Authorization.isUserRegistered(qdacityUser);

			if (qdacityUser.getLastCourseId() != id) { // Check if lastcourse property of user has to be updated
				LastCourseUsed task = new LastCourseUsed(qdacityUser, id);
				Queue queue = QueueFactory.getDefaultQueue();
				queue.add(com.google.appengine.api.taskqueue.TaskOptions.Builder.withPayload(task));
			}

            course = (Course) Cache.getOrLoad(id, Course.class);

		} finally {
			mgr.close();
		}
		return course;
	}

	/**
	 * This method gets the entity having primary key id. It uses HTTP GET method.
	 *
	 * @param id the primary key of the java bean.
	 * @return The entity with primary key id.
	 * @throws UnauthorizedException
	 */
	@ApiMethod(name = "course.getTermCourse")
	public TermCourse getTermCourse(@Named("id") Long id, User user) throws UnauthorizedException {

		com.qdacity.user.User qdacityUser = userEndpoint.getCurrentUser(user); // also checks if user is registered

		PersistenceManager mgr = getPersistenceManager();
		TermCourse termCourse = null;
		try {
			termCourse = (TermCourse) mgr.getObjectById(TermCourse.class, id);
		}
		catch (Exception e) {
			throw new javax.jdo.JDOObjectNotFoundException("Term Course does not exist");
		};

		try {
			java.util.logging.Logger.getLogger("logger").log(Level.INFO, " Getting Course " + id);

			// Check if user is registered
			Authorization.isUserRegistered(qdacityUser);

			termCourse = (TermCourse) Cache.getOrLoad(id, TermCourse.class);

		} finally {
			mgr.close();
		}
		return termCourse;
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
	@ApiMethod(name = "course.listTermCourse", path = "listTermCourse")
	public List<TermCourse> listTermCourse(@Named("courseID") Long courseID, User user) throws UnauthorizedException {

		if (user == null) throw new UnauthorizedException("User not authorized"); // TODO currently no user is authorized to list all courses

		PersistenceManager mgr = null;
		List<TermCourse> execute = null;

		try {
			mgr = getPersistenceManager();

			Query q = mgr.newQuery(TermCourse.class, ":p.contains(courseID)");

			execute = (List<TermCourse>) q.execute(Arrays.asList(courseID));

			// Tight loop for fetching all entities from datastore and accomodate
			// for lazy fetch.
			for (TermCourse obj : execute);
		} finally {
			mgr.close();
		}

		Collections.sort(execute, new Comparator<TermCourse>() {
		    public int compare(TermCourse t1, TermCourse t2) {
		        return t1.getCreationDate().compareTo(t2.getCreationDate());
		    }
		});
		return execute;
	}

	/**
	 * This method lists all the entities inserted in datastore.
	 * It uses HTTP GET method and paging support.
	 *
	 * @return A List containing the list of all terms in which the user is a participant
	 * @throws UnauthorizedException
	 */
	@SuppressWarnings({ "unchecked" })
	@ApiMethod(name = "course.listTermCourseByParticipant",
		path = "listTermCourseByParticipant")
	public List<TermCourse> listTermCourseByParticipant(User user) throws UnauthorizedException {

		com.qdacity.user.User qdacityUser = userEndpoint.getCurrentUser(user); // also checks if user is registered

		if (user == null) throw new UnauthorizedException("User is not logged in"); // TODO currently no user is authorized to list all courses

		PersistenceManager mgr = null;
		List<TermCourse> execute = null;

		try {
			mgr = getPersistenceManager();

			Query q = mgr.newQuery(TermCourse.class, ":p.contains(participants)");

			execute = (List<TermCourse>) q.execute(Arrays.asList(qdacityUser.getId()));

		} finally {
			mgr.close();
		}

		Collections.sort(execute, new Comparator<TermCourse>() {
		    public int compare(TermCourse t1, TermCourse t2) {
		        return t1.getCreationDate().compareTo(t2.getCreationDate());
		    }
		});
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
	@ApiMethod(name = "course.insertTermCourse")
		public TermCourse insertTermCourse(TermCourse termCourse, User user) throws UnauthorizedException {

			com.qdacity.user.User qdacityUser = userEndpoint.getCurrentUser(user); // also checks if user is registered

			termCourse.setOpen(true);
			termCourse.setCreationDate(new Date());
			termCourse.setOwningUserGroups(new ArrayList<>(Long));


			PersistenceManager mgr = getPersistenceManager();
			try {
				if (termCourse.getId() != null) {
					if (containsTermCourse(termCourse)) {
						throw new EntityExistsException("Term already exists");
					}
				}
				try {
					termCourse.addOwner(qdacityUser.getId());
					Authorization.checkAuthorizationTermCourse(termCourse, user);
					mgr.makePersistent(termCourse);
					qdacityUser.addTermCourseAuthorization(termCourse.getId());
					
					mgr.makePersistent(qdacityUser);
					Cache.cache(qdacityUser.getId(), com.qdacity.user.User.class, qdacityUser);
					AuthenticatedUser authenticatedUser = (AuthenticatedUser) user;
					Cache.cacheAuthenticatedUser(authenticatedUser, qdacityUser); // also cache external user id
				}
				catch (javax.jdo.JDOObjectNotFoundException ex) {
					throw new javax.jdo.JDOObjectNotFoundException("User is not registered");
				}

			} finally {
				mgr.close();
			}
			return termCourse;
	}

	@ApiMethod(name = "course.listTermCourseByUserGroupId",
			path = "course.listTermCourseByUserGroupId")
	public List<TermCourse> listTermCourseByUserGroupId(@Named("userGroupId") Long userGroupId, User user) throws UnauthorizedException {
		com.qdacity.user.User qdacityUser = userEndpoint.getCurrentUser(user); // also checks if user is registered
		if (user == null) throw new UnauthorizedException("User is not logged in"); // TODO currently no user is authorized to list all courses

		PersistenceManager mgr = null;
		List<TermCourse> execute = null;
		try {
			mgr = getPersistenceManager();
			Query q = mgr.newQuery(TermCourse.class, ":p.contains(owningUserGroups)");
			execute = (List<TermCourse>) q.execute(Arrays.asList(qdacityUser.getId()));
		} finally {
			mgr.close();
		}

		Collections.sort(execute, new Comparator<TermCourse>() {
			public int compare(TermCourse t1, TermCourse t2) {
				return t1.getCreationDate().compareTo(t2.getCreationDate());
			}
		});
		return execute;
	}

	@ApiMethod(name = "course.insertTermCourseForUserGroup")
	public TermCourse insertTermCourseForUserGroup(TermCourse termCourse, @Named("userGroupId") Long userGroupId, User user) throws UnauthorizedException {

		com.qdacity.user.User qdacityUser = userEndpoint.getCurrentUser(user); // also checks if user is registered
		UserGroup userGroup = (UserGroup) Cache.getOrLoad(userGroupId, UserGroup.class);

		termCourse.setOpen(true);
		termCourse.setCreationDate(new Date());
		termCourse.setOwningUserGroups(new ArrayList<>(Long));


		PersistenceManager mgr = getPersistenceManager();
		try {
			if (termCourse.getId() != null) {
				if (containsTermCourse(termCourse)) {
					throw new EntityExistsException("Term already exists");
				}
			}
			try {
				termCourse.setOwningUserGroups(Arrays.asList(userGroupId));
				termCourse = mgr.makePersistent(termCourse);
				Cache.cache(termCourse.getId(), Course.class, termCourse);

				userGroup.getTermCourses().add(termCourse.getId());
				mgr.makePersistent(userGroup);
				Cache.cache(userGroup.getId(), UserGroup.class, userGroup);
			}
			catch (JDOObjectNotFoundException ex) {
				throw new JDOObjectNotFoundException("User is not registered");
			}

		} finally {
			mgr.close();
		}
		return termCourse;
	}


	/**
	 * This method removes the entity with primary key id.
	 * It uses HTTP DELETE method.
	 *
	 * @param id the primary key of the entity to be deleted.
	 * @throws UnauthorizedException
	 */
	@ApiMethod(name = "course.removeTermCourse")
	public void removeTermCourse(@Named("id") Long id, User user) throws UnauthorizedException {
		PersistenceManager mgr = getPersistenceManager();
		try {
			TermCourse termCourse = (TermCourse) mgr.getObjectById(TermCourse.class, id);

			// Check if user is authorized
			Authorization.checkAuthorizationTermCourse(termCourse, user);

			List<String> userIDs = termCourse.getOwners();


			for (String courseUserIDs : userIDs) {
				com.qdacity.user.User termCourseUser = mgr.getObjectById(com.qdacity.user.User.class, courseUserIDs);

				termCourseUser.removeTermCourseAuthorization(id);
				mgr.makePersistent(termCourseUser);

			}

			// Finally remove the actual course
			mgr.deletePersistent(termCourse);
		} finally {
			mgr.close();
		}
	}

	@ApiMethod(name = "course.addParticipant")
		public TermCourse addParticipant(@Named("id") Long termCourseID, @Nullable @Named("userID") String userID, User user) throws UnauthorizedException {

			com.qdacity.user.User qdacityUser = userEndpoint.getCurrentUser(user); // also checks if user is registered

			TermCourse termCourse = null;
			PersistenceManager mgr = getPersistenceManager();
			try {
				termCourse = (TermCourse) mgr.getObjectById(TermCourse.class, termCourseID);
				//Check authorization
				if (userID != null) {
					Authorization.checkAuthTermCourseParticipation(termCourse, userID, user);
					termCourse.addParticipant(userID);
				}
				else {
					Authorization.checkAuthTermCourseParticipation(termCourse, qdacityUser.getId(), user);
					termCourse.addParticipant(qdacityUser.getId());
				}

				qdacityUser.addTermCourseAuthorization(termCourseID);

				mgr.makePersistent(termCourse);
				mgr.makePersistent(qdacityUser);

				Cache.cache(qdacityUser.getId(), com.qdacity.user.User.class, qdacityUser);
				AuthenticatedUser authenticatedUser = (AuthenticatedUser) user;
				Cache.cacheAuthenticatedUser(authenticatedUser, qdacityUser); // also cache external user id
			} finally {
				mgr.close();
			}
			return termCourse;
		}

	@ApiMethod(name = "course.setTermCourseStatus",
			path = "termCourse")
		public TermCourse setTermCourseStatus(@Named("id") Long termCourseID, @Named("isOpen") boolean status, User user) throws UnauthorizedException {
			TermCourse termCourse = null;
			PersistenceManager mgr = getPersistenceManager();

			try {
				termCourse = (TermCourse) mgr.getObjectById(TermCourse.class, termCourseID);
			}
			catch (Exception e) {
				throw new javax.jdo.JDOObjectNotFoundException("Course does not exist");
			};

			// Check if user is Authorized (authorization for the course means authorization for all terms under this course)
			Authorization.checkAuthorizationTermCourse(termCourse, user);

			try {
				termCourse.setOpen(status);
				mgr.makePersistent(termCourse);

			} finally {
				mgr.close();
			}
			return termCourse;
		}

	@ApiMethod(name = "course.removeParticipant")
		public TermCourse removeParticipant(@Named("id") Long termCourseID, @Nullable @Named("userID") String userID, User user) throws UnauthorizedException {

			com.qdacity.user.User qdacityUser = userEndpoint.getCurrentUser(user); // also checks if user is registered

			TermCourse termCourse = null;
			PersistenceManager mgr = getPersistenceManager();
			try {
				termCourse = (TermCourse) mgr.getObjectById(TermCourse.class, termCourseID);
				Authorization.checkAuthTermCourseUserRemoval(termCourse, userID, user);
				termCourse.removeParticipant(userID);

				qdacityUser.removeCourseAuthorization(termCourseID);

				mgr.makePersistent(termCourse);
				mgr.makePersistent(qdacityUser);

				Cache.cache(qdacityUser.getId(), com.qdacity.user.User.class, qdacityUser);
				AuthenticatedUser authenticatedUser = (AuthenticatedUser) user;
				Cache.cacheAuthenticatedUser(authenticatedUser, qdacityUser); // also cache external user id
			} finally {
				mgr.close();
			}
			return termCourse;
		}

	@ApiMethod(name = "course.inviteUser")
		public Course inviteUserCourse(@Named("courseID") Long courseID, @Named("userEmail") String userEmail, User user) throws UnauthorizedException {

			com.qdacity.user.User qdacityUser = userEndpoint.getCurrentUser(user); // also checks if user is registered

			Course course = null;
			PersistenceManager mgr = getPersistenceManager();
			try {

				// Get the invited user
				Query q = mgr.newQuery(com.qdacity.user.User.class, "email == '" + userEmail + "'");
				@SuppressWarnings("unchecked")
				List<com.qdacity.user.User> dbUsers = (List<com.qdacity.user.User>) q.execute();
				String userID = dbUsers.get(0).getId();

				course = (Course) mgr.getObjectById(Course.class, courseID);
				course.addInvitedUser(userID);
				mgr.makePersistent(course);

				// Create notification
				UserNotification notification = new UserNotification();
				notification.setDatetime(new Date());
				notification.setMessage("Course: " + course.getName());
				notification.setSubject("Invitation by <b>" + qdacityUser.getGivenName() + " " + qdacityUser.getSurName() + "</b>");
				notification.setOriginUser(qdacityUser.getId());
				notification.setCourse(courseID);
				notification.setSettled(false);
				notification.setType(UserNotificationType.INVITATION_COURSE);
				notification.setUser(userID.toString());

				mgr.makePersistent(notification);

			} finally {
				mgr.close();
			}
			return course;
		}

	@ApiMethod(name = "course.inviteUserTermCourse")
		public TermCourse inviteUserTermCourse(@Named("termCourseID") Long termCourseID, @Named("userEmail") String userEmail, User user) throws UnauthorizedException {

			com.qdacity.user.User qdacityUser = userEndpoint.getCurrentUser(user); // also checks if user is registered

			TermCourse termCourse = null;
			PersistenceManager mgr = getPersistenceManager();
			try {

				// Get the invited user
				Query q = mgr.newQuery(com.qdacity.user.User.class, "email == '" + userEmail + "'");
				@SuppressWarnings("unchecked")
				List<com.qdacity.user.User> dbUsers = (List<com.qdacity.user.User>) q.execute();
				String userID = dbUsers.get(0).getId();

				termCourse = (TermCourse) mgr.getObjectById(TermCourse.class, termCourseID);
				termCourse.addInvitedUser(userID);
				mgr.makePersistent(termCourse);

				// Create notification
				UserNotification notification = new UserNotification();
				notification.setDatetime(new Date());
				notification.setMessage("Term Course: " + termCourse.getTerm());
				notification.setSubject("Invitation by <b>" + qdacityUser.getGivenName() + " " + qdacityUser.getSurName() + "</b>");
				notification.setOriginUser(qdacityUser.getId());
				notification.setTermCourse(termCourseID);
				notification.setCourse(termCourse.getCourseID());
				notification.setSettled(false);
				notification.setType(UserNotificationType.INVITATION_TERM_COURSE);
				notification.setUser(userID.toString());

				mgr.makePersistent(notification);

			} finally {
				mgr.close();
			}
			return termCourse;
		}

	@ApiMethod(name = "course.addCourseOwner")
		public Course addCourseOwner(@Named("courseID") Long courseID, @Nullable @Named("userID") String userID, User user) throws UnauthorizedException {

			com.qdacity.user.User qdacityUser = userEndpoint.getCurrentUser(user); // also checks if user is registered

			Course course = null;
			PersistenceManager mgr = getPersistenceManager();

			try {
				course = (Course) mgr.getObjectById(Course.class, courseID);
				Authorization.checkAuthorizationCourse(course, user);

				course.addOwner(userID);

				qdacityUser.addCourseAuthorization(courseID);
				mgr.makePersistent(course);
				mgr.makePersistent(qdacityUser);

			} finally {
				mgr.close();
			}
			return course;
		}

	/**
	 * This method lists all the entities inserted in datastore.
	 * It uses HTTP GET method and paging support.
	 *
	 * @return A CollectionResponse class containing the list of all participants of a term course
	 *         persisted and a cursor to the next page.
	 * @throws UnauthorizedException
	 */
	@SuppressWarnings("unchecked")
	@ApiMethod(
		name = "course.listTermCourseParticipants",
		path = "termCourse"
	)
	public CollectionResponse<com.qdacity.user.User> listTermCourseParticipants(@Nullable @Named("cursor") String cursorString, @Nullable @Named("limit") Integer limit, @Named("termCourseID") Long termCourseID, User user) throws UnauthorizedException {
		List<com.qdacity.user.User> users = new ArrayList<com.qdacity.user.User>();
		PersistenceManager mgr = getPersistenceManager();
		try {
			TermCourse termCourse = mgr.getObjectById(TermCourse.class, termCourseID);
			Authorization.checkAuthorizationTermCourse(termCourse, user);
			List<String> participants = termCourse.getParticipants();
			if (participants != null) {
				if (!participants.isEmpty()) {
					Query userQuery = mgr.newQuery(com.qdacity.user.User.class, ":p.contains(id)");

					users = (List<com.qdacity.user.User>) userQuery.execute(participants);
				}
			}
		} finally {
			mgr.close();
		}

		return CollectionResponse.<com.qdacity.user.User> builder().setItems(users).setNextPageToken(cursorString).build();
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
