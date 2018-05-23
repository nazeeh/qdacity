package com.qdacity.endpoint;

import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.annotation.Nullable;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.inject.Named;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import javax.persistence.EntityExistsException;

import com.google.appengine.api.taskqueue.Queue;
import com.google.appengine.api.taskqueue.QueueFactory;
import com.qdacity.authentication.AuthenticatedUser;
import com.qdacity.exercise.ExerciseGroup;
import com.qdacity.project.metrics.*;
import com.qdacity.project.metrics.tasks.*;
import com.qdacity.user.LoginProviderType;
import org.json.JSONException;

import com.google.api.server.spi.auth.common.User;
import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.response.UnauthorizedException;
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
	 * @param exerciseGroup the entity to be inserted.
	 * @return The inserted entity.
	 * @throws UnauthorizedException
	 */
	@ApiMethod(name = "exercise.insertExerciseGroup")
	public ExerciseGroup insertExerciseGroup(ExerciseGroup exerciseGroup, User user) throws UnauthorizedException {
		PersistenceManager mgr = getPersistenceManager();
		try {
			if (exerciseGroup.getId() != null) {
				if (containsExerciseGroup(exerciseGroup)) {
					throw new EntityExistsException("Exercise group already exists");
				}
			}

			try {
				TermCourse termCourse = mgr.getObjectById(TermCourse.class, exerciseGroup.getTermCourseID());
				Authorization.checkAuthorizationTermCourse(termCourse, user);
				mgr.makePersistent(exerciseGroup);
			}
			catch (javax.jdo.JDOObjectNotFoundException ex) {
				throw new javax.jdo.JDOObjectNotFoundException("The corresponding term course was not found");
			}

		} finally {
			mgr.close();
		}
		return exerciseGroup;
	}

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
        exercise.setSnapshotsAlreadyCreated(false);
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
     * This inserts a new entity into App Engine datastore. If the entity already
     * exists in the datastore, an exception is thrown.
     * It uses HTTP POST method.
     *
     * @param exercise the entity to be inserted.
     * @return The inserted entity.
     * @throws UnauthorizedException
     */
    @ApiMethod(name = "exercise.createAndInsertExerciseToExerciseGroup")
    public Exercise createAndInsertExerciseToExerciseGroup(Exercise exercise, @Named("ExerciseGroupID") Long ExerciseGroupID, User user) throws UnauthorizedException {
        exercise.setSnapshotsAlreadyCreated(false);
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

            try {
                ExerciseGroup exerciseGroup = mgr.getObjectById(ExerciseGroup.class, ExerciseGroupID);
                exerciseGroup.addExercise(exercise.getId().toString());
                mgr.makePersistent(exerciseGroup);
            }
            catch (javax.jdo.JDOObjectNotFoundException ex) {
                throw new javax.jdo.JDOObjectNotFoundException("The corresponding exercise group was not found");
            }

        } finally {
            mgr.close();
        }
        return exercise;
    }

    /**
     * This inserts a new exercise into App Engine datastore. If the entity already
     * exists in the datastore, an exception is thrown.
     * It uses HTTP POST method.
     *
     * @param ExerciseGroup the entity to be inserted.
     * @return The inserted entity.
     * @throws UnauthorizedException
     */
    @ApiMethod(name = "exercise.insertExerciseGroupForNewExercise", path = "exercise.insertExerciseGroupForNewExercise")
    public ExerciseGroup insertExerciseGroupForNewExercise(Exercise newExercise, @Named("existingExerciseID") Long existingExerciseID, @Named("ExerciseGroupName") String ExerciseGroupName, User user) throws UnauthorizedException {
        Logger LOGGER = Logger.getLogger("ExerciseEndpointTest");
        newExercise.setSnapshotsAlreadyCreated(false);
        PersistenceManager mgr = getPersistenceManager();
        ExerciseGroup exerciseGroup = new ExerciseGroup();
        List<String> exerciseIDs = new ArrayList<>();

        try {

            if (newExercise.getId() != null) {
                if (containsExercise(newExercise)) {
                    throw new EntityExistsException("Exercise already exists");
                }
            }

            try {
                TermCourse termCourse = mgr.getObjectById(TermCourse.class, newExercise.getTermCourseID());
                Authorization.checkAuthorizationTermCourse(termCourse, user);
                mgr.makePersistent(newExercise);
            }
            catch (javax.jdo.JDOObjectNotFoundException ex) {
                throw new javax.jdo.JDOObjectNotFoundException("The corresponding term course was not found");
            }

            exerciseIDs.add(existingExerciseID.toString());
            exerciseIDs.add(newExercise.getId().toString());
            Exercise existingExercise = mgr.getObjectById(Exercise.class, existingExerciseID);
            exerciseGroup.setName(ExerciseGroupName);
            exerciseGroup.setProjectRevisionID(existingExercise.getProjectRevisionID());
            exerciseGroup.setTermCourseID(existingExercise.getTermCourseID());
            exerciseGroup.setExercises(exerciseIDs);
            mgr.makePersistent(exerciseGroup);

        } finally {
            mgr.close();
        }
        return exerciseGroup;
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
     * This method lists all the exercise groups which belong to a specific term course
     * It uses HTTP GET method and paging support.
     *
     * @return A list of ExerciseGroups class containing the ExerciseGroups which belong to the specified term course
     *         persisted and a cursor to the next page.
     * @throws UnauthorizedException
     */
    @SuppressWarnings({ "unchecked" })
    @ApiMethod(
            name = "exercise.listTermCourseExerciseGroups",
            path = "listTermCourseExerciseGroups"
    )
    public List<ExerciseGroup> listTermCourseExerciseGroups(@Named("termCrsID") Long termCourseID, User user) throws UnauthorizedException {

        com.qdacity.user.User qdacityUser = userEndpoint.getCurrentUser(user); // also checks if user is registered

        PersistenceManager mgr = null;
        List<ExerciseGroup> execute = null;

        try {
            mgr = getPersistenceManager();
            TermCourse termCourse = mgr.getObjectById(TermCourse.class, termCourseID);
            Authorization.checkAuthTermCourseParticipation(termCourse, qdacityUser.getId(), user);
            Query q = mgr.newQuery(ExerciseGroup.class, ":p.contains(termCourseID)");

            execute = (List<ExerciseGroup>) q.execute(Arrays.asList(termCourseID));

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

            List<ExerciseProject> exerciseProjects = this.getExerciseProjectsByExerciseID(id, user);
            ProjectEndpoint pe = new ProjectEndpoint();
            for (ExerciseProject project : exerciseProjects ) {
                pe.removeExerciseProject(project.getId(), user);
            }

			mgr.deletePersistent(exercise);
		} finally {
			mgr.close();
		}
	}


	@ApiMethod(name = "exercise.createExerciseProject")
		public ExerciseProject createExerciseProject(@Named("revisionID") Long revisionID, @Named("exerciseID") Long exerciseID,  User loggedInUser) throws UnauthorizedException, JSONException {
			ExerciseProject cloneExerciseProject = null;
			PersistenceManager mgr = getPersistenceManager();

			try {

				Exercise exercise = (Exercise) mgr.getObjectById(Exercise.class, exerciseID);
				TermCourse termCourse = (TermCourse) mgr.getObjectById(TermCourse.class, exercise.getTermCourseID());
				// Check if user is authorized
				Authorization.checkAuthorizationTermCourse(termCourse, loggedInUser);

				com.qdacity.user.User qdacityUser = new UserEndpoint().getCurrentUser(loggedInUser);

				cloneExerciseProject = createExerciseProjectLocal(exerciseID, revisionID, qdacityUser, loggedInUser);

			} finally {
				mgr.close();
			}
			return cloneExerciseProject;
		}

    @SuppressWarnings("unchecked")
    @ApiMethod(name = "exercise.listExerciseReports")
    public List<ExerciseReport> listExerciseReports(@Named("projectID") Long prjID,@Named("exerciseID") Long exerciseID, User user) throws UnauthorizedException {
        List<ExerciseReport> reports = new ArrayList<>();
        PersistenceManager mgr = getPersistenceManager();
        try {


            Exercise exercise = (Exercise) mgr.getObjectById(Exercise.class, exerciseID);
            TermCourse termCourse = (TermCourse) mgr.getObjectById(TermCourse.class, exercise.getTermCourseID());
            // Check if user is authorized
            Authorization.checkAuthorizationTermCourse(termCourse, user);

            Query q;
            q = mgr.newQuery(ExerciseReport.class, " projectID  == :projectID");

            Map<String, Long> params = new HashMap<>();
            params.put("projectID", prjID);

            reports = (List<ExerciseReport>) q.executeWithMap(params);

            if(reports != null) {
                for (ExerciseReport exerciseReport : reports) {
                    List<DocumentResult> docresults = exerciseReport.getDocumentResults();
                    try {
                        if (docresults != null) for (DocumentResult documentResult : docresults)
                            documentResult.getReportRow();
                    } catch (NullPointerException e) {
                        // should not happen, but if data (old data) for docresults is corrupt, we still want the reports
                        Logger.getLogger("logger").log(Level.WARNING, "docresults not null, but could not iterate through list");
                    }
                }
            }
        } finally {
            mgr.close();
        }
        return reports;
    }

    @SuppressWarnings("unchecked")
    @ApiMethod(name = "exercise.listExerciseReportsByRevisionID", path = "exercise.listExerciseReportsByRevisionID")
    public List<ExerciseReport> listExerciseReportsByRevisionID(@Named("revisionID") Long revID, @Named("exerciseID") Long exerciseID, User user) throws UnauthorizedException {
        List<ExerciseReport> reports = new ArrayList<>();
        PersistenceManager mgr = getPersistenceManager();
        try {

            Exercise exercise = (Exercise) mgr.getObjectById(Exercise.class, exerciseID);
            TermCourse termCourse = (TermCourse) mgr.getObjectById(TermCourse.class, exercise.getTermCourseID());
            // Check if user is authorized
            Authorization.checkAuthorizationTermCourse(termCourse, user);

            Query q;
            Map<String, Long> params = new HashMap<>();
            q = mgr.newQuery(ExerciseReport.class, " revisionID  == :revisionID && exerciseID == :exerciseID");
            params.put("revisionID", revID);
            params.put("exerciseID", exerciseID);
            reports = (List<ExerciseReport>) q.executeWithMap(params);


        } finally {
            mgr.close();
        }
        return reports;
    }

	@SuppressWarnings({ "unchecked"})
	@ApiMethod(name = "exercise.createExerciseProjectIfNeeded")
		public ExerciseProject createExerciseProjectIfNeeded(@Named("revisionID") Long revisionID, @Named("exerciseID") Long exerciseID,  User loggedInUser) throws UnauthorizedException, JSONException {

			com.qdacity.user.User qdacityUser = new UserEndpoint().getCurrentUser(loggedInUser);

			ExerciseProject cloneExerciseProject = null;
			List<ExerciseProject> exerciseProjects = null;
			PersistenceManager mgr = getPersistenceManager();
            StringBuilder filters = new StringBuilder();
            Map<String, Object> parameters = new HashMap<>();

			try {


                Exercise exercise = (Exercise) mgr.getObjectById(Exercise.class, exerciseID);
                TermCourse termCourse = (TermCourse) mgr.getObjectById(TermCourse.class, exercise.getTermCourseID());
                // Check if user is authorized
                Authorization.checkAuthorizationTermCourse(termCourse, loggedInUser);

                filters.append("exerciseID == exerciseID && ");
                parameters.put("exerciseID", exerciseID);
                filters.append("validationCoders == :userID && ");
                parameters.put("userID", qdacityUser.getId());
                filters.append("isSnapshot == false");
                Query q = mgr.newQuery(ExerciseProject.class);

                q.setFilter(filters.toString());
                exerciseProjects = (List<ExerciseProject>)q.executeWithMap(parameters);

                if (exerciseProjects != null) {
                    if (exerciseProjects.size() == 0) {
                        cloneExerciseProject = createExerciseProjectLocal(exerciseID, revisionID, qdacityUser, loggedInUser);
                    }
                }

			} finally {
				mgr.close();
			}
			return cloneExerciseProject;
		}


	//Fetches the original (not a snapshot) ExerciseProject which belongs to an exercise (there should be only one per student per exercise)
	@SuppressWarnings("unchecked")
	@ApiMethod(name = "exercise.getExerciseProjectByRevisionID")
		public ExerciseProject getExerciseProjectByRevisionID(@Named("revisionID") Long revisionID, @Named("exerciseID") Long exerciseID, User user) throws UnauthorizedException, JSONException {
			PersistenceManager mgr = getPersistenceManager();
			List<ExerciseProject> exerciseProjects = null;
			ExerciseProject exerciseProject = null;
            com.qdacity.user.User qdacityUser = new UserEndpoint().getCurrentUser(user);
			try {

                Query q;
                Map<String, Object> params = new HashMap<>();
                q = mgr.newQuery(ExerciseProject.class, " revisionID  == :revisionID && exerciseID == :exerciseID && isSnapshot == false && validationCoders == :userID");
                params.put("revisionID", revisionID);
                params.put("exerciseID", exerciseID);
                params.put("userID", qdacityUser.getId());
                exerciseProjects = (List<ExerciseProject>) q.executeWithMap(params);

				if (exerciseProjects.size() > 0) {
					exerciseProject = exerciseProjects.get(0);
				}
			} finally {
				mgr.close();
			}
			return exerciseProject;
		}

    @SuppressWarnings("unchecked")
    @ApiMethod(name = "exercise.getExercisesByProjectRevisionID")
    public List<Exercise> getExercisesByProjectRevisionID(@Named("revisionID") Long revisionID, User user) throws UnauthorizedException, JSONException {
        PersistenceManager mgr = getPersistenceManager();
        List<Exercise> exercises;
        try {
            Query q = mgr.newQuery(Exercise.class, ":p.contains(projectRevisionID)");
            exercises = (List<Exercise>) q.execute(Arrays.asList(revisionID));
        } finally {
            mgr.close();
        }
        return exercises;
    }

    @SuppressWarnings("unchecked")
    @ApiMethod(name = "exercise.getExercisesOfExerciseGroup",
            path = "getExercisesOfExerciseGroup")
    public List<Exercise> getExercisesOfExerciseGroup(@Named("exerciseGroupID") Long exerciseGroupID, User user) throws UnauthorizedException, JSONException {
        PersistenceManager mgr = getPersistenceManager();
        List<Exercise> exercises = null;
        ExerciseGroup exerciseGroup;
        List<String> exerciseIDs;
        List<Long> exerciseIDsLong = new ArrayList<>();
        try {

            exerciseGroup = mgr.getObjectById(ExerciseGroup.class, exerciseGroupID);
            if (exerciseGroup != null) {
                TermCourse termCourse = (TermCourse) mgr.getObjectById(TermCourse.class, exerciseGroup.getTermCourseID());
                // Check if user is authorized
                Authorization.checkAuthorizationTermCourse(termCourse, user);

                //Convert Exercise ids from string to long, otherwise the query doesn't work properly
                exerciseIDs = exerciseGroup.getExercises();
                for (String exerciseID : exerciseIDs) {
                    exerciseIDsLong.add(Long.parseLong(exerciseID));
                }

                Query q = mgr.newQuery(Exercise.class, ":p.contains(id)");
                exercises = (List<Exercise>) q.execute(exerciseIDsLong);
            }

        } finally {
            mgr.close();
        }
        return exercises;
    }

    @SuppressWarnings("unchecked")
    @ApiMethod(name = "exercise.getExerciseGroupsByProjectRevisionID")
    public List<ExerciseGroup> getExerciseGroupsByProjectRevisionID(@Named("revisionID") Long revisionID, User user) throws UnauthorizedException, JSONException {
        PersistenceManager mgr = getPersistenceManager();
        List<ExerciseGroup> exerciseGroups;
        try {
            Query q = mgr.newQuery(ExerciseGroup.class, ":p.contains(projectRevisionID)");
            exerciseGroups = (List<ExerciseGroup>) q.execute(Arrays.asList(revisionID));
        } finally {
            mgr.close();
        }
        return exerciseGroups;
    }

    @SuppressWarnings("unchecked")
    @ApiMethod(name = "exercise.getExerciseGroupByID" , path = "getExerciseGroupByID")
    public ExerciseGroup getExerciseGroupByID(@Named("id") Long id, User user) throws UnauthorizedException, JSONException {
        PersistenceManager mgr = getPersistenceManager();
        ExerciseGroup exerciseGroup;
        try {
            exerciseGroup = mgr.getObjectById(ExerciseGroup.class, id);
        } finally {
            mgr.close();
        }
        return exerciseGroup;
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

			Query q = mgr.newQuery(ExerciseProject.class);

			exercise = mgr.getObjectById(Exercise.class, exerciseID);

		} finally {
			mgr.close();
		}
		return exercise;
	}

	private ExerciseProject cloneExerciseProject(ProjectRevision projectRev) {

		ExerciseProject cloneProject = new ExerciseProject(projectRev);

		cloneProject.setCodesystemID(projectRev.getCodesystemID());

		return cloneProject;

	}

	@ApiMethod(name = "exercise.evaluateExerciseRevision")
	public List<ExerciseProject> evaluateExerciseRevision(@Named("exerciseID") Long exerciseID, @Named("revisionID") Long revisionID, @Named("name") String name, @Named("docs") String docIDsString, @Named("method") String evaluationMethod, @Named("unit") String unitOfCoding, @Named("raterIds")  @Nullable String raterIds, User user) throws UnauthorizedException {

	    PersistenceManager mgr = getPersistenceManager();
        Exercise exercise = mgr.getObjectById(Exercise.class, exerciseID);
        TermCourse termCourse = mgr.getObjectById(TermCourse.class, exercise.getTermCourseID());
        // Check if user is authorized
        Authorization.checkAuthorizationTermCourse(termCourse, user);

		DeferredEvaluation task = new DeferredEvaluationExerciseReport(exerciseID, revisionID, name, docIDsString, evaluationMethod, unitOfCoding, raterIds, user);
		// Set instance variables etc as you wish
		Queue queue = QueueFactory.getDefaultQueue();
		queue.add(com.google.appengine.api.taskqueue.TaskOptions.Builder.withPayload(task));

		return null;
	}

	@SuppressWarnings("unchecked")
	@ApiMethod(name = "exercise.listExerciseResults")
	public List<ExerciseResult> listExerciseResults(@Named("reportID") Long reportID, @Named("exerciseID") Long exerciseID, User user) throws UnauthorizedException {
		PersistenceManager mgr = getPersistenceManager();
		List<ExerciseResult> results = new ArrayList<ExerciseResult>();
		mgr.setIgnoreCache(true); // TODO should probably only be set during generation of new reports, but if not set the report generation can run into an infinite loop
		try {

            Exercise exercise = mgr.getObjectById(Exercise.class, exerciseID);
            TermCourse termCourse = mgr.getObjectById(TermCourse.class, exercise.getTermCourseID());
            // Check if user is authorized
            Authorization.checkAuthorizationTermCourse(termCourse, user);

			Query q = mgr.newQuery(ExerciseResult.class, "reportID  == :reportID");
			Map<String, Long> params = new HashMap<String, Long>();
			params.put("reportID", reportID);

			results = (List<ExerciseResult>) q.execute(reportID);

		} finally {
			mgr.close();
		}
		return results;
	}

	@ApiMethod(name = "exercise.sendNotificationEmailExercise")
	public void sendNotificationEmailExercise(@Named("reportID") Long reportID, User user) throws UnauthorizedException {

        PersistenceManager mgr = getPersistenceManager();
        ExerciseReport report = mgr.getObjectById(ExerciseReport.class, reportID);
        Exercise exercise = mgr.getObjectById(Exercise.class, report.getExerciseID());
        TermCourse termCourse = mgr.getObjectById(TermCourse.class, exercise.getTermCourseID());
        // Check if user is authorized
        Authorization.checkAuthorizationTermCourse(termCourse, user);


		DeferredEmailNotification task = new DeferredEmailNotification(reportID, user);
		// Set instance variables etc as you wish
		Queue queue = QueueFactory.getDefaultQueue();
		queue.add(com.google.appengine.api.taskqueue.TaskOptions.Builder.withPayload(task));
	}

    @SuppressWarnings("unchecked")
    @ApiMethod(name = "exercise.deleteExerciseProjectReport")
    public List<ExerciseReport> deleteExerciseProjectReport(@Named("reportID") Long repID, User user) throws UnauthorizedException {
        List<ExerciseReport> reports = new ArrayList<>(); // FIXME Why?
        PersistenceManager mgr = getPersistenceManager();
        try {
            ExerciseReport report = mgr.getObjectById(ExerciseReport.class, repID);

            Exercise exercise = mgr.getObjectById(Exercise.class, report.getExerciseID());
            TermCourse termCourse = mgr.getObjectById(TermCourse.class, exercise.getTermCourseID());
            // Check if user is authorized
            Authorization.checkAuthorizationTermCourse(termCourse, user);
            
            DeferredReportDeletion task = new DeferredExerciseReportDeletion(repID);
            Queue queue = QueueFactory.getDefaultQueue();
            queue.add(com.google.appengine.api.taskqueue.TaskOptions.Builder.withPayload(task));

            // Lazy fetch
            List<DocumentResult> docResults = report.getDocumentResults();
            for (DocumentResult documentResult : docResults) {
                documentResult.getAgreementMap();
            }

            // Delete the actual report
            mgr.deletePersistent(report);

        } finally {
            mgr.close();
        }
        return reports;
    }

    //Fetches exercises whose deadlines have passed, then creates snapshots of exerciseProjects which belong to these exercises
    //This method is called by ExerciseDeadlineServlet which is triggered by a cronjob every 5 minutes
	public void checkAndCreateExerciseProjectSnapshotsIfNeeded(User loggedInUser) {

	    Date now = new Date();
        List<Exercise> exercises = null;
        PersistenceManager mgr = getPersistenceManager();
        StringBuilder filters = new StringBuilder();
        Map<String, Object> parameters = new HashMap<>();
        filters.append("exerciseDeadline <:now && ");
        parameters.put("now", now);
        filters.append("snapshotsAlreadyCreated == false");

        try {
            Query q = mgr.newQuery(Exercise.class);
            q.setFilter(filters.toString());
            exercises = (List<Exercise>)q.executeWithMap(parameters);
            for (Exercise exercise : exercises) {
                    createSnapshotsForExpiredExerciseProjects(exercise.getId(), loggedInUser);
                    exercise.setSnapshotsAlreadyCreated(true);
                    mgr.makePersistent(exercise);
                    java.util.logging.Logger.getLogger("logger").log(Level.INFO, "creating exercise project snapshots for exercise: " + exercise.getName());
            }
        }
        finally {
            mgr.close();
        }
    }

    private static void createSnapshotsForExpiredExerciseProjects(Long exerciseID, User loggedInUser) {
	    List<ExerciseProject> exerciseProjects;
        StringBuilder filters = new StringBuilder();
        Map<String, Object> parameters = new HashMap<>();
        PersistenceManager mgr = getPersistenceManager();
        List<ExerciseProject> clonedExerciseProjects = new ArrayList<>();
        ProjectRevision parentProject;
        try {
            //fetch exerciseProjects related to the exercise whose deadline has passed
            filters.append("exerciseID == exerciseID");
            parameters.put("exerciseID", exerciseID);
            Query q = mgr.newQuery(ExerciseProject.class);
            q.setFilter(filters.toString());
            exerciseProjects = (List<ExerciseProject>)q.executeWithMap(parameters);

            if (exerciseProjects != null && exerciseProjects.size() > 0) {

                //The parent project of all exerciseProjects which belong to the same exercise is the same, so it can be assigned from the first exerciseProject
                parentProject = mgr.getObjectById(ProjectRevision.class, exerciseProjects.get(0).getRevisionID());

                //construct clonedExerciseProjects and set their properties to the original exerciseProjects
                //Afterwards, all of the clonedExerciseProjects are persisted
                for (ExerciseProject exerciseProject : exerciseProjects) {
                        ExerciseProject clonedExerciseProject = new ExerciseProject(parentProject);
                        clonedExerciseProject.setExerciseID(exerciseProject.getExerciseID());
                        clonedExerciseProject.setValidationCoders(exerciseProject.getValidationCoders());
                        clonedExerciseProject.setCreatorName(exerciseProject.getCreatorName());
                        clonedExerciseProject.setParagraphFMeasure(exerciseProject.getParagraphFMeasure());
                        clonedExerciseProject.setUmlEditorEnabled(exerciseProject.isUmlEditorEnabled());
                        clonedExerciseProject.setIsSnapshot(true);
                        clonedExerciseProjects.add(clonedExerciseProject);
                }

                //Persist the clonedExerciseProjects, then clone their TextDocuments
                mgr.makePersistentAll(clonedExerciseProjects);
                for (ExerciseProject clonedExerciseProject : clonedExerciseProjects) {
                    try {
                        cloneExerciseProjectTextDocs(clonedExerciseProject, parentProject, loggedInUser);
                    }
                    catch (UnauthorizedException e) {
                        java.util.logging.Logger.getLogger("logger").log(Level.WARNING, "The user is not authorized to clone the exerciseProjects of this exercise");
                    }
                }
            }
        } finally {
            mgr.close();
        }
    }

    private static void cloneExerciseProjectTextDocs (ExerciseProject exerciseProject, ProjectRevision parentProject, User loggedInUser) throws UnauthorizedException {
        TextDocumentEndpoint.cloneTextDocuments(parentProject, ProjectType.EXERCISE, exerciseProject.getId(), false, loggedInUser);
    }

	private ExerciseProject createExerciseProjectLocal(Long exerciseID, Long revisionID, com.qdacity.user.User user, User loggedInUser) throws UnauthorizedException {

		PersistenceManager mgr = getPersistenceManager();

		ProjectRevision project = null;
		ExerciseProject cloneExerciseProject = null;

		project = mgr.getObjectById(ProjectRevision.class, revisionID);

		cloneExerciseProject = cloneExerciseProject(project);

        cloneExerciseProject.setIsSnapshot(false);
		cloneExerciseProject.addValidationCoder(user.getId());
		cloneExerciseProject.setExerciseID(exerciseID);
		com.qdacity.user.User validationCoder = mgr.getObjectById(com.qdacity.user.User.class, user.getId());

		cloneExerciseProject.setCreatorName(validationCoder.getGivenName() + " " + validationCoder.getSurName());

		cloneExerciseProject = mgr.makePersistent(cloneExerciseProject);
		project = mgr.makePersistent(project);

		TextDocumentEndpoint.cloneTextDocuments(project, ProjectType.EXERCISE, cloneExerciseProject.getId(), true, loggedInUser);

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

	private boolean containsExerciseGroup(ExerciseGroup exerciseGroup) {
		PersistenceManager mgr = getPersistenceManager();
		boolean contains = true;
		try {
			mgr.getObjectById(ExerciseGroup.class, exerciseGroup.getId());
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
