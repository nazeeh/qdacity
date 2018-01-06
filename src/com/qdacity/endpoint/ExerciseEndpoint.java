package com.qdacity.endpoint;

import java.util.Arrays;
import java.util.Date;
import java.util.List;

import javax.inject.Named;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import javax.persistence.EntityExistsException;

import org.json.JSONException;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.users.User;
import com.qdacity.Authorization;
import com.qdacity.Constants;
import com.qdacity.PMF;
import com.qdacity.course.TermCourse;
import com.qdacity.exercise.Exercise;
import com.qdacity.exercise.ValidationExercise;
import com.qdacity.project.ProjectRevision;
import com.qdacity.project.ValidationProject;
import com.qdacity.user.UserNotification;
import com.qdacity.user.UserNotificationType;


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
	public Exercise insertExercise(Exercise exercise, User user) throws UnauthorizedException {

		PersistenceManager mgr = getPersistenceManager();
		try {
			if (exercise.getId() != null) {
				if (containsExercise(exercise)) {
					throw new EntityExistsException("Exercise already exists");
				}
				
				
			}
			
			try {
				TermCourse termCourse = mgr.getObjectById(TermCourse.class, exercise.getTermCourseID());
				Authorization.checkAuthorizationTermCourse(termCourse, user);
				mgr.makePersistent(exercise);
			}
			catch (javax.jdo.JDOObjectNotFoundException ex) {
				throw new javax.jdo.JDOObjectNotFoundException("The corresponding term course was not found");
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
	@SuppressWarnings({ "unchecked" })
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
	
	/**
	 * This method removes the entity with primary key id.
	 * It uses HTTP DELETE method.
	 *
	 * @param id the primary key of the entity to be deleted.
	 * @throws UnauthorizedException
	 */
	@ApiMethod(name = "exercise.removeExercise",

		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public void removeExercise(@Named("id") Long id, User user) throws UnauthorizedException {
		PersistenceManager mgr = getPersistenceManager();
		try {
			Exercise exercise = (Exercise) mgr.getObjectById(Exercise.class, id);
			TermCourse termCourse = (TermCourse) mgr.getObjectById(TermCourse.class, exercise.getTermCourseID());
			// Check if user is authorized
			Authorization.checkAuthorizationTermCourse(termCourse, user);

			mgr.deletePersistent(exercise);
		} finally {
			mgr.close();
		}
	}
	

	@ApiMethod(name = "exercise.createValidationExercise",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public ValidationExercise createValidationExercise(@Named("revisionID") Long revisionID, @Named("userID") String userID, User user) throws UnauthorizedException, JSONException {
		ProjectRevision project = null;
		ValidationExercise cloneExercise = null;
		PersistenceManager mgr = getPersistenceManager();
		try {
			project = mgr.getObjectById(ProjectRevision.class, revisionID);

			cloneExercise = createValidationExercise(project, user);

			cloneExercise.addValidationCoder(userID);
			com.qdacity.user.User validationCoder = mgr.getObjectById(com.qdacity.user.User.class, userID);

			cloneExercise.setCreatorName(validationCoder.getGivenName() + " " + validationCoder.getSurName());
			// cloneProject.setRevisionID(project.getId());// FIXME Check why this works and previous assignments dont

			cloneExercise = mgr.makePersistent(cloneExercise);
			project = mgr.makePersistent(project);

			TextDocumentEndpoint.cloneTextDocuments(project, cloneExercise.getId(), true, user);


		} finally {
			mgr.close();
		}
		return cloneExercise;
	}
	
	private ValidationExercise createValidationExercise(ProjectRevision projectRev, User user) throws UnauthorizedException {

		ValidationExercise cloneProject = new ValidationExercise(projectRev);

		cloneProject.setCodesystemID(projectRev.getCodesystemID());

		return cloneProject;

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
