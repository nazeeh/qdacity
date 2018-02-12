package com.qdacity.endpoint;

import java.util.*;
import javax.inject.Named;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import javax.persistence.EntityExistsException;

import org.json.JSONException;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.api.server.spi.auth.common.User;
import com.qdacity.Authorization;
import com.qdacity.Constants;
import com.qdacity.PMF;
import com.qdacity.authentication.QdacityAuthenticator;
import com.qdacity.course.TermCourse;
import com.qdacity.exercise.Exercise;
import com.qdacity.exercise.ExerciseProject;
import com.qdacity.project.ProjectRevision;
import com.qdacity.project.ProjectType;


@Api(name = "qdacity",
	version = Constants.VERSION,
	namespace = @ApiNamespace(ownerDomain = "qdacity.com",
		ownerName = "qdacity.com",
		packagePath = "server.project"),
	authenticators = {QdacityAuthenticator.class})
public class ExerciseEndpoint {
	
	private UserEndpoint userEndpoint = new UserEndpoint();

	/**
	 * This inserts a new entity into App Engine datastore. If the entity already
	 * exists in the datastore, an exception is thrown.
	 * It uses HTTP POST method.
	 *
	 * @param exercise the entity to be inserted.
	 * @return The inserted entity.
	 * @throws UnauthorizedException
	 */
	@ApiMethod(name = "exercise.insertExercise")
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
	@ApiMethod(
		name = "exercise.listTermCourseExercises",
		path = "listTermCourseExercises"
	)
	public List<Exercise> listTermCourseExercises(@Named("termCrsID") Long termCourseID, User user) throws UnauthorizedException {

		com.qdacity.user.User qdacityUser = userEndpoint.getCurrentUser(user); // also checks if user is registered
		
		PersistenceManager mgr = null;
		List<Exercise> execute = null;

		try {
			mgr = getPersistenceManager();
			TermCourse termCourse = mgr.getObjectById(TermCourse.class, termCourseID);
			Authorization.checkAuthTermCourseParticipation(termCourse, qdacityUser.getId(), user);
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
	@ApiMethod(name = "exercise.removeExercise")
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
	

	@ApiMethod(name = "exercise.createExerciseProject")
		public ExerciseProject createExerciseProject(@Named("revisionID") Long revisionID, @Named("exerciseID") Long exerciseID,  User user) throws UnauthorizedException, JSONException {
			ExerciseProject cloneExerciseProject = null;
			PersistenceManager mgr = getPersistenceManager();
			
			try {
				
				Exercise exercise = (Exercise) mgr.getObjectById(Exercise.class, exerciseID);
				TermCourse termCourse = (TermCourse) mgr.getObjectById(TermCourse.class, exercise.getTermCourseID());
				// Check if user is authorized
				Authorization.checkAuthorizationTermCourse(termCourse, user);
				
				cloneExerciseProject = createExerciseProjectLocal(exerciseID, revisionID, user);

			} finally {
				mgr.close();
			}
			return cloneExerciseProject;
		}

	
	@SuppressWarnings({ "unchecked"})
	@ApiMethod(name = "exercise.createExerciseProjectIfNeeded")
		public ExerciseProject createExerciseProjectIfNeeded(@Named("revisionID") Long revisionID, @Named("exerciseID") Long exerciseID,  User user) throws UnauthorizedException, JSONException {
			
			ExerciseProject cloneExerciseProject = null;
			List<ExerciseProject> exerciseProjects = null;
			PersistenceManager mgr = getPersistenceManager();
            StringBuilder filters = new StringBuilder();
            Map<String, Object> parameters = new HashMap<>();

			try {


                Exercise exercise = (Exercise) mgr.getObjectById(Exercise.class, exerciseID);
                TermCourse termCourse = (TermCourse) mgr.getObjectById(TermCourse.class, exercise.getTermCourseID());
                // Check if user is authorized
                Authorization.checkAuthorizationTermCourse(termCourse, user);

                filters.append("exerciseID == exerciseID && ");
                parameters.put("exerciseID", exerciseID);
                filters.append("validationCoders == :userID");
                parameters.put("userID", user.getId());
                Query q = mgr.newQuery(ExerciseProject.class);

                q.setFilter(filters.toString());
                exerciseProjects = (List<ExerciseProject>)q.executeWithMap(parameters);

                if (exerciseProjects != null) {
                    if (exerciseProjects.size() == 0) {
                        cloneExerciseProject = createExerciseProjectLocal(exerciseID, revisionID, user);
                    }
                }

			} finally {
				mgr.close();
			}
			return cloneExerciseProject;
		}

		
	@SuppressWarnings("unchecked")
	@ApiMethod(name = "exercise.getExerciseProjectByRevisionID")
		public ExerciseProject getExerciseProjectByRevisionID(@Named("revisionID") Long revisionID, User user) throws UnauthorizedException, JSONException {
			PersistenceManager mgr = getPersistenceManager();
			List<ExerciseProject> exerciseProjects = null;
			ExerciseProject exerciseProject = null;
			try {

				Query q = mgr.newQuery(ExerciseProject.class, ":p.contains(revisionID)");

				exerciseProjects = (List<ExerciseProject>) q.execute(Arrays.asList(revisionID));
				if (exerciseProjects.size() > 0) {
					exerciseProject = exerciseProjects.get(0);
				}
			} finally {
				mgr.close();
			}
			return exerciseProject;
		}
	
	@SuppressWarnings("unchecked")
	@ApiMethod(name = "exercise.getExerciseProjectsByExerciseID")
		public List<ExerciseProject> getExerciseProjectsByExerciseID(@Named("exerciseID") Long exerciseID, User user) throws UnauthorizedException, JSONException {
			PersistenceManager mgr = getPersistenceManager();
			List<ExerciseProject> exerciseProjects = null;
			try {

				Exercise exercise = (Exercise) mgr.getObjectById(Exercise.class, exerciseID);
				TermCourse termCourse = (TermCourse) mgr.getObjectById(TermCourse.class, exercise.getTermCourseID());
				// Check if user is authorized
				Authorization.checkAuthorizationTermCourse(termCourse, user);

				Query q = mgr.newQuery(ExerciseProject.class, ":p.contains(exerciseID)");

				exerciseProjects = (List<ExerciseProject>) q.execute(Arrays.asList(exerciseID));

			} finally {
				mgr.close();
			}
			return exerciseProjects;
		}

	@SuppressWarnings("unchecked")
	@ApiMethod(name = "exercise.getExerciseByID")
	public Exercise getExerciseByID(@Named("exerciseID") Long exerciseID, User user) throws UnauthorizedException, JSONException {
		PersistenceManager mgr = getPersistenceManager();
		Exercise exercise = null;
		try {

			Query q = mgr.newQuery(ExerciseProject.class, ":p.contains(exerciseID)");

			exercise = mgr.getObjectById(Exercise.class, exerciseID);

		} finally {
			mgr.close();
		}
		return exercise;
	}

	private ExerciseProject cloneExerciseProject(ProjectRevision projectRev, User user) throws UnauthorizedException {

		ExerciseProject cloneProject = new ExerciseProject(projectRev);

		cloneProject.setCodesystemID(projectRev.getCodesystemID());

		return cloneProject;

	}
	
	private ExerciseProject createExerciseProjectLocal(Long exerciseID, Long revisionID ,User user) throws UnauthorizedException {

		PersistenceManager mgr = getPersistenceManager();
		
		ProjectRevision project = null;
		ExerciseProject cloneExerciseProject = null;
		
		project = mgr.getObjectById(ProjectRevision.class, revisionID);

		cloneExerciseProject = cloneExerciseProject(project, user);

		cloneExerciseProject.addValidationCoder(user.getId());
		cloneExerciseProject.setExerciseID(exerciseID);
		com.qdacity.user.User validationCoder = mgr.getObjectById(com.qdacity.user.User.class, user.getId());

		cloneExerciseProject.setCreatorName(validationCoder.getGivenName() + " " + validationCoder.getSurName());

		cloneExerciseProject = mgr.makePersistent(cloneExerciseProject);
		project = mgr.makePersistent(project);

		TextDocumentEndpoint.cloneTextDocuments(project, ProjectType.EXERCISE, cloneExerciseProject.getId(), true, user);
		
		return cloneExerciseProject;
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
