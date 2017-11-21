package com.qdacity.endpoint;

import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.logging.Level;

import javax.annotation.Nullable;
import javax.inject.Named;
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
import com.qdacity.authentication.FirebaseAuthenticator;
import com.qdacity.course.Course;
import com.qdacity.course.TermCourse;
import com.qdacity.course.tasks.LastCourseUsed;
import com.qdacity.user.UserNotification;
import com.qdacity.user.UserNotificationType;


@Api(name = "qdacity",
	version = Constants.VERSION,
	namespace = @ApiNamespace(ownerDomain = "qdacity.com",
		ownerName = "qdacity.com",
		packagePath = "server.project"),
	authenticators = {FirebaseAuthenticator.class})
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
	@ApiMethod(name = "course.listCourse", path = "courses")
	public CollectionResponse<Course> listCourse(@Nullable @Named("cursor") String cursorString, @Nullable @Named("limit") Integer limit, User user) throws UnauthorizedException {

		if (user == null) throw new UnauthorizedException("User not authorized"); // TODO currently no user is authorized to list all courses

		PersistenceManager mgr = null;
		List<Course> execute = null;

		try {
			mgr = getPersistenceManager();

			Query q = mgr.newQuery(Course.class, ":p.contains(owners)");

			execute = (List<Course>) q.execute(Arrays.asList(user.getId()));

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


		PersistenceManager mgr = getPersistenceManager();
		try {
			if (course.getId() != null) {
				if (containsCourse(course)) {
					throw new EntityExistsException("Course already exists");
				}
			}

			try {
				course.addOwner(user.getId());
				mgr.makePersistent(course);
				// Authorize User
				com.qdacity.user.User dbUser = mgr.getObjectById(com.qdacity.user.User.class, user.getId());
				Authorization.isUserRegistered(dbUser);
				dbUser.addCourseAuthorization(course.getId());
				Cache.cache(dbUser.getId(), com.qdacity.user.User.class, dbUser);
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

		PersistenceManager mgr = getPersistenceManager();
		try {
			String userIdToRemove = "";


			userIdToRemove = user.getId();

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
	@ApiMethod(name = "course.getCourse", path = "course")
	public Course getCourse(@Named("id") Long id, User user) throws UnauthorizedException {

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
			com.qdacity.user.User dbUser = mgr.getObjectById(com.qdacity.user.User.class, user.getId());
			Authorization.isUserRegistered(dbUser);

			if (dbUser.getLastCourseId() != id) { // Check if lastcourse property of user has to be updated
				LastCourseUsed task = new LastCourseUsed(dbUser, id);
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
			com.qdacity.user.User dbUser = mgr.getObjectById(com.qdacity.user.User.class, user.getId());
			Authorization.isUserRegistered(dbUser);

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
	@SuppressWarnings({ "unchecked", "unused" })
	@ApiMethod(name = "course.listTermCourseByParticipant",
		path = "listTermCourseByParticipant")
	public List<TermCourse> listTermCourseByParticipant(User user) throws UnauthorizedException {

		if (user == null) throw new UnauthorizedException("User is not logged in"); // TODO currently no user is authorized to list all courses

		PersistenceManager mgr = null;
		List<TermCourse> execute = null;

		try {
			mgr = getPersistenceManager();

			Query q = mgr.newQuery(TermCourse.class, ":p.contains(participants)");

			execute = (List<TermCourse>) q.execute(Arrays.asList(user.getId()));

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
	 * This inserts a new instance of a course into App Engine datastore. If the entity already
	 * exists in the datastore, an exception is thrown.
	 * It uses HTTP POST method.
	 *
	 * @param termCourse, the entity to be inserted.
	 * @return The inserted entity.
	 * @throws UnauthorizedException
	 */
	@ApiMethod(name = "course.insertTermCourse")
	public TermCourse insertTermCourse(@Named("CourseID") Long courseID, @Nullable @Named ("courseTerm") String term, TermCourse termCourse, User user) throws UnauthorizedException {

		termCourse.setCourseID(courseID);
		termCourse.setTerm(term);
		termCourse.setOpen(true);
		termCourse.setCreationDate(new Date());


		PersistenceManager mgr = getPersistenceManager();

		try {
			// Authorize User
			com.qdacity.user.User dbUser = mgr.getObjectById(com.qdacity.user.User.class, user.getId());
			Authorization.isUserRegistered(dbUser);
		}
		catch (javax.jdo.JDOObjectNotFoundException ex) {
			throw new javax.jdo.JDOObjectNotFoundException("User is not registered");
		}

		try {
			if (termCourse.getId() != null) {
				if (containsTermCourse(termCourse)) {
					throw new EntityExistsException("Term already exists");
				}
			}

			termCourse.addOwner(user.getId());
			mgr.makePersistent(termCourse);

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
			TermCourse termCourse = null;
			PersistenceManager mgr = getPersistenceManager();
			try {
				termCourse = (TermCourse) mgr.getObjectById(TermCourse.class, termCourseID);
				//Check authorization
				Authorization.checkAuthTermCourseParticipation(termCourse, userID, user);
				termCourse.addParticipant(userID);

				com.qdacity.user.User dbUser = mgr.getObjectById(com.qdacity.user.User.class, user.getId());
				dbUser.addTermCourseAuthorization(termCourseID);

				mgr.makePersistent(termCourse);
				mgr.makePersistent(dbUser);
				Cache.cache(user.getId(), com.qdacity.user.User.class, dbUser);

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
			TermCourse termCourse = null;
			PersistenceManager mgr = getPersistenceManager();
			try {
				termCourse = (TermCourse) mgr.getObjectById(TermCourse.class, termCourseID);
				Authorization.checkAuthTermCourseUserRemoval(termCourse, userID, user);
				termCourse.removeParticipant(userID);


				com.qdacity.user.User dbUser = mgr.getObjectById(com.qdacity.user.User.class, user.getId());
				dbUser.removeCourseAuthorization(termCourseID);

				mgr.makePersistent(termCourse);
				mgr.makePersistent(dbUser);
				Cache.cache(user.getId(), com.qdacity.user.User.class, dbUser);

			} finally {
				mgr.close();
			}
			return termCourse;
		}

	@ApiMethod(name = "course.inviteUser")
		public Course inviteUserCourse(@Named("courseID") Long courseID, @Named("userEmail") String userEmail, User user) throws UnauthorizedException {
			Course course = null;
			PersistenceManager mgr = getPersistenceManager();
			try {

				// Get the invited user
				Query q = mgr.newQuery(com.qdacity.user.User.class, "email == '" + userEmail + "'");
				@SuppressWarnings("unchecked")
				List<com.qdacity.user.User> dbUsers = (List<com.qdacity.user.User>) q.execute();
				String userID = dbUsers.get(0).getId();

				// Get the inviting user
				com.qdacity.user.User invitingUser = mgr.getObjectById(com.qdacity.user.User.class, user.getId());

				course = (Course) mgr.getObjectById(Course.class, courseID);
				course.addInvitedUser(userID);
				mgr.makePersistent(course);

				// Create notification
				UserNotification notification = new UserNotification();
				notification.setDatetime(new Date());
				notification.setMessage("Course: " + course.getName());
				notification.setSubject("Invitation by <b>" + invitingUser.getGivenName() + " " + invitingUser.getSurName() + "</b>");
				notification.setOriginUser(user.getId());
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

	@ApiMethod(name = "course.addCourseOwner")
		public Course addCourseOwner(@Named("courseID") Long courseID, @Nullable @Named("userID") String userID, User user) throws UnauthorizedException {

			Course course = null;
			PersistenceManager mgr = getPersistenceManager();
			
			try {
				course = (Course) mgr.getObjectById(Course.class, courseID);
				Authorization.checkAuthorizationCourse(course, user);
				
				course.addOwner(userID);

				com.qdacity.user.User dbUser = mgr.getObjectById(com.qdacity.user.User.class, user.getId());
				dbUser.addCourseAuthorization(courseID);
				mgr.makePersistent(course);
				mgr.makePersistent(dbUser);
				
			} finally {
				mgr.close();
			}
			return course;
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
