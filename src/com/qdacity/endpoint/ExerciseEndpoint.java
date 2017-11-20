package com.qdacity.endpoint;

import javax.inject.Named;
import javax.jdo.PersistenceManager;
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
	 * @param course the entity to be inserted.
	 * @return The inserted entity.
	 * @throws UnauthorizedException
	 */
	@ApiMethod(name = "course.insertExercise",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public Exercise insertExercise(@Named("termCrsID") Long termCourseID, Exercise exercise, User user) throws UnauthorizedException {

		exercise.setTermCourseID(termCourseID);

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
