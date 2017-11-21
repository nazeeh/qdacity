package com.qdacity.endpoint;

import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

import javax.annotation.Nullable;
import javax.inject.Named;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import javax.persistence.EntityExistsException;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.users.User;
import com.qdacity.Authorization;
import com.qdacity.Cache;
import com.qdacity.Constants;
import com.qdacity.PMF;
import com.qdacity.course.Course;
import com.qdacity.course.TermCourse;
import com.qdacity.exercise.Exercise;


@Api(name = "qdacity",
	version = Constants.VERSION,
	namespace = @ApiNamespace(ownerDomain = "qdacity.com",
		ownerName = "qdacity.com",
		packagePath = "server.project"))
public class ExerciseEndpoint {

	/**
	 * This inserts a new entity into App Engine datastore. If the entity already
	 * exists in the datastore, an exception is thrown.
	 * It uses HTTP POST method.
	 *
	 * @param exercise the entity to be inserted.
	 * @return The inserted entity.
	 * @throws UnauthorizedException
	 */
	@ApiMethod(name = "exercise.insertExercise",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public Exercise insertExercise(@Named("termCrsID") Long termCourseID, @Nullable @Named("name") String name, Exercise exercise, User user) throws UnauthorizedException {

		exercise.setTermCourseID(termCourseID);
		exercise.setName(name);
		PersistenceManager mgr = getPersistenceManager();
		try {
			if (exercise.getId() != null) {
				if (containsExercise(exercise)) {
					throw new EntityExistsException("Exercise already exists");
				}
			}

			try {
				// Authorize User
				com.qdacity.user.User dbUser = mgr.getObjectById(com.qdacity.user.User.class, user.getUserId());
				Authorization.isUserRegistered(dbUser);
				mgr.makePersistent(exercise);
			}
			catch (javax.jdo.JDOObjectNotFoundException ex) {
				throw new javax.jdo.JDOObjectNotFoundException("User is not registered");
			}

		} finally {
			mgr.close();
		}
		return exercise;
	}
	
	/**
	 * This method lists all the exercises which belong to a specific term course
	 * It uses HTTP GET method and paging support.
	 *
	 * @return A CollectionResponse class containing the list of all exercises
	 *         persisted and a cursor to the next page.
	 * @throws UnauthorizedException
	 */
	@SuppressWarnings({ "unchecked", "unused" })
	@ApiMethod(name = "exercise.listTermCourseExercises",
		path = "listTermCourseExercises",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public List<Exercise> listTermCourseExercises(@Named("termCrsID") Long termCourseID, User user) throws UnauthorizedException {

		
		PersistenceManager mgr = null;
		List<Exercise> execute = null;

		try {
			mgr = getPersistenceManager();
			TermCourse termCourse = mgr.getObjectById(TermCourse.class, termCourseID);
			Authorization.checkAuthTermCourseParticipation(termCourse, user.getUserId(), user);
			Query q = mgr.newQuery(Exercise.class, ":p.contains(termCourseID)");

			execute = (List<Exercise>) q.execute(Arrays.asList(termCourseID));

		} finally {
			mgr.close();
		}

		return execute;
	}
	
	private boolean containsExercise(Exercise exercise) {
		PersistenceManager mgr = getPersistenceManager();
		boolean contains = true;
		try {
			mgr.getObjectById(Exercise.class, exercise.getId());
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
