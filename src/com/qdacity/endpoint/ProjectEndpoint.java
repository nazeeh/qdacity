package com.qdacity.endpoint;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
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

import com.qdacity.user.UserGroup;
import org.json.JSONException;

import com.google.api.server.spi.auth.common.User;
import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.response.CollectionResponse;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.memcache.MemcacheService;
import com.google.appengine.api.taskqueue.Queue;
import com.google.appengine.api.taskqueue.QueueFactory;
import com.qdacity.Authorization;
import com.qdacity.Cache;
import com.qdacity.Constants;
import com.qdacity.Credentials;
import com.qdacity.PMF;
import com.qdacity.Sendgrid;
import com.qdacity.authentication.AuthenticatedUser;
import com.qdacity.authentication.QdacityAuthenticator;
import com.qdacity.exercise.ExerciseProject;
import com.qdacity.project.AbstractProject;
import com.qdacity.project.Project;
import com.qdacity.project.ProjectRevision;
import com.qdacity.project.ProjectType;
import com.qdacity.project.RevisionComparator;
import com.qdacity.project.ValidationProject;
import com.qdacity.project.codesystem.Code;
import com.qdacity.project.codesystem.CodeSystem;
import com.qdacity.project.data.TextDocument;
import com.qdacity.project.tasks.LastProjectUsed;
import com.qdacity.user.UserNotification;
import com.qdacity.user.UserNotificationType;

@Api(name = "qdacity",
	version = Constants.VERSION,
	namespace = @ApiNamespace(ownerDomain = "qdacity.com",
		ownerName = "qdacity.com",
		packagePath = "server.project"),
	authenticators = {QdacityAuthenticator.class})
public class ProjectEndpoint {

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
	@ApiMethod(name = "project.listProject", path = "projects")
	public CollectionResponse<Project> listProject(@Nullable @Named("cursor") String cursorString, @Nullable @Named("limit") Integer limit, User user) throws UnauthorizedException {

		com.qdacity.user.User qdacityUser = userEndpoint.getCurrentUser(user); // also checks if user is registered
		
		if (user == null) throw new UnauthorizedException("User not authorized"); // TODO currently no user is authorized to list all projects

		return getProjectsByUserId(cursorString, qdacityUser.getId());
	}

	@ApiMethod(name = "project.listProjectByUserId",
		path = "projectsByUserId",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public CollectionResponse<Project> listProjectByUserId(@Nullable @Named("cursor") String cursorString, @Nullable @Named("limit") Integer limit, @Named("userId") String userId, User user) throws UnauthorizedException {

		com.qdacity.user.User requestedUser = (com.qdacity.user.User) Cache.getOrLoad(userId, com.qdacity.user.User.class);

		Authorization.checkAuthorization(requestedUser, user);

		return getProjectsByUserId(cursorString, userId);
	}

	private CollectionResponse<Project> getProjectsByUserId(@Nullable @Named("cursor") String cursorString, String userId) {
		PersistenceManager mgr = null;
		List<Project> execute = null;

		try {
			mgr = getPersistenceManager();

			Query q = mgr.newQuery(Project.class, ":p.contains(owners)");

			execute = (List<Project>) q.execute(Arrays.asList(userId));

			// Tight loop for fetching all entities from datastore and accomodate
			// for lazy fetch.
			for (Project obj : execute);
		} finally {
			mgr.close();
		}

		return CollectionResponse.<Project> builder().setItems(execute).setNextPageToken(cursorString).build();
	}

	@ApiMethod(name = "project.listByUserGroupId")
	public CollectionResponse<Project> listProjectByUserGroupId(@Nullable @Named("cursor") String cursorString, @Nullable @Named("limit") Integer limit, @Named("userGroupId") Long userGroupId, User user) throws UnauthorizedException {
		UserGroup userGroup = (com.qdacity.user.UserGroup) Cache.getOrLoad(userGroupId, com.qdacity.user.UserGroup.class);
		com.qdacity.user.User requestingUser = Cache.getOrLoadUserByAuthenticatedUser((AuthenticatedUser) user);

		if(!userGroup.getParticipants().contains(requestingUser.getId())) { // allow participants of group
			Authorization.checkAuthorization(userGroup, user); // and owners and admins
		}

		PersistenceManager mgr = null;
		List<Project> execute = null;
		try {
			mgr = getPersistenceManager();
			Query q = mgr.newQuery(Project.class, ":p.contains(owningUserGroups)");
			execute = (List<Project>) q.execute(Arrays.asList(userGroupId));

			// Tight loop for fetching all entities from datastore and accomodate
			// for lazy fetch.
			for (Project obj : execute);
		} finally {
			mgr.close();
		}
		return CollectionResponse.<Project> builder().setItems(execute).setNextPageToken(cursorString).build();
	}

	@SuppressWarnings("unchecked")
	@ApiMethod(name = "project.listValidationProject")
	public List<ValidationProject> listValidationProject(User user) throws UnauthorizedException {
		
		com.qdacity.user.User qdacityUser = userEndpoint.getCurrentUser(user); // also checks if user is registered

		return getValidationProjectsByUserId(user, qdacityUser.getId());
	}

	@SuppressWarnings("unchecked")
	@ApiMethod(name = "project.listValidationProjectByUserId",
		path = "validationProjectsByUserId",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public List<ValidationProject> listValidationProjectByUserId(@Named("userId") String userId, User user) throws UnauthorizedException {
		com.qdacity.user.User requestedUser = (com.qdacity.user.User) Cache.getOrLoad(userId, com.qdacity.user.User.class);

		Authorization.checkAuthorization(requestedUser, user);

		return getValidationProjectsByUserId(user, userId);
	}

	private List<ValidationProject> getValidationProjectsByUserId(User user, String userId) throws UnauthorizedException {
		if (user == null) throw new UnauthorizedException("User not authorized"); // TODO user unknown

		PersistenceManager mgr = getPersistenceManager();
		List<ValidationProject> execute = null;

		try {

			Query q = mgr.newQuery(ValidationProject.class, ":p.contains(validationCoders)");

			execute = (List<ValidationProject>) q.execute(Arrays.asList(userId));

			// Tight loop for fetching all entities from datastore and accomodate
			// for lazy fetch.
			for (ValidationProject obj : execute);
		} finally {
			mgr.close();
		}
		return execute;
	}

	/**
	 * This method gets the entity having primary key id. It uses HTTP GET method.
	 *
	 * @param id the primary key of the java bean.
	 * @return The entity with primary key id.
	 * @throws UnauthorizedException
	 */
	@ApiMethod(name = "project.getProject",	path = "project")
	public AbstractProject getProject(@Named("id") Long id, @Named("type") String type, User user) throws UnauthorizedException {

		com.qdacity.user.User qdacityUser = userEndpoint.getCurrentUser(user); // also checks if user is registered
		
		PersistenceManager mgr = getPersistenceManager();
		AbstractProject project = null;
		try {
			java.util.logging.Logger.getLogger("logger").log(Level.INFO, " Getting Project " + id);
			Authorization.isUserNotNull(user);

			if (qdacityUser.getLastProjectId() != id) { // Check if lastProject property of user has to be updated
				// Update User async TODO: check if actually faster than saving directly
				LastProjectUsed task = new LastProjectUsed(qdacityUser, id, ProjectType.valueOf(type));
				Queue queue = QueueFactory.getDefaultQueue();
				queue.add(com.google.appengine.api.taskqueue.TaskOptions.Builder.withPayload(task));
			}

			String keyString;
			MemcacheService syncCache;
			switch (type) {
				case "VALIDATION":
					project = (ValidationProject) Cache.getOrLoad(id, ValidationProject.class);
					Authorization.checkAuthorization((ValidationProject) project, qdacityUser); // FIXME rethink authorization needs. Consider public projects where the basic info can be accessed, but not changed, by everyone.
					break;
				case "REVISION":
					project = (ProjectRevision) Cache.getOrLoad(id, ProjectRevision.class);
					// Authorization.checkAuthorization((ValidationProject)project, dbUser); // FIXME rethink authorization needs. Consider public projects where the basic info can be accessed, but not changed, by everyone.
					break;
				case "EXERCISE":
					project = (ProjectRevision) Cache.getOrLoad(id, ProjectRevision.class);
					break;
				default:
					project = (Project) Cache.getOrLoad(id, Project.class);
					// Authorization.checkAuthorization((Project)project, user);
					break;
			}

		} finally {
			mgr.close();
		}
		return project;
	}

	/**
	 * This method gets the entity having primary key id. It uses HTTP GET method.
	 *
	 * @param projectID the primary key of the java bean.
	 * @return The entity with primary key id.
	 * @throws UnauthorizedException
	 */
	@ApiMethod(name = "project.incrCodingId", path = "codings")
	public AbstractProject getAndIncrCodingId(@Named("id") Long projectID, @Named("type") String type, User user) throws UnauthorizedException {
		PersistenceManager mgr = getPersistenceManager();
		AbstractProject project = null;
		try {
			switch (type) {
				case "EXERCISE":
					project = mgr.getObjectById(ExerciseProject.class, projectID);
					break;
				case "VALIDATION":
					project = mgr.getObjectById(ValidationProject.class, projectID);
					break;
				default: // PROJECT
					project = (Project) Cache.getOrLoad(projectID, Project.class);
					break;
			}
			// Check if user is authorized // FIXME Authorization
			// Authorization.checkAuthorization(project, user);
			project.setMaxCodingID(project.getMaxCodingID() + 1);
			// ++project.maxCodingID;
		} finally {
			mgr.close();
		}
		updateProject(project, user);
		return project;
	}

	/**
	 * This inserts a new entity into App Engine datastore. If the entity already
	 * exists in the datastore, an exception is thrown.
	 * It uses HTTP POST method.
	 *
	 * @param project the entity to be inserted.
	 * @return The inserted entity.
	 * @throws UnauthorizedException
	 */
	@SuppressWarnings("ResourceParameter")
	@ApiMethod(name = "project.insertProject")
	public Project insertProject(Project project, User user) throws UnauthorizedException {
		com.qdacity.user.User qdacityUser = userEndpoint.getCurrentUser(user); // also checks if user is registered

		PersistenceManager mgr = getPersistenceManager();
		try {
			if (project.getId() != null) {
				if (containsProject(project)) {
					throw new EntityExistsException("Object already exists");
				}
			}

			try {
				project.addOwner(qdacityUser.getId());
				project.setRevision(0);
				project.setMaxCodingID(0L);
				project = mgr.makePersistent(project);
				// update user
				qdacityUser.addProjectAuthorization(project.getId());
				mgr.makePersistent(qdacityUser);
				Cache.cache(qdacityUser.getId(), com.qdacity.user.User.class, qdacityUser);
				AuthenticatedUser authenticatedUser = (AuthenticatedUser) user;
				Cache.cacheAuthenticatedUser(authenticatedUser, qdacityUser); // also cache external user id
			} catch (JDOObjectNotFoundException e) {
				throw new UnauthorizedException("User is not registered");
			}

		} finally {
			mgr.close();
		}
		return project;
	}

	/**
	 * Inserts project for a user group.
	 * @param project
	 * @param userGroupId
	 * @param user
	 * @return
	 * @throws UnauthorizedException
	 */
	@SuppressWarnings("ResourceParameter")
	@ApiMethod(name = "project.insertProjectForUserGroup")
	public Project insertProjectForUserGroup(Project project, @Named("userGroupId") Long userGroupId, User user) throws UnauthorizedException {
		com.qdacity.user.User qdacityUser = userEndpoint.getCurrentUser(user); // also checks if user is registered

		PersistenceManager mgr = getPersistenceManager();
		try {
			if (project.getId() != null) {
				if (containsProject(project)) {
					throw new EntityExistsException("Object already exists");
				}
			}

			try {
				project.setOwningUserGroups(Arrays.asList(userGroupId));
				project.setRevision(0);
				project.setMaxCodingID(0L);
				project = mgr.makePersistent(project);
				Cache.cache(project.getId(), Project.class, project);

				// update user groups
				UserGroup userGroup = (UserGroup) Cache.getOrLoad(userGroupId, UserGroup.class);
				userGroup.getProjects().add(project.getId());
				mgr.makePersistent(userGroup);
				Cache.cache(userGroup.getId(), UserGroup.class, userGroup);
			} catch (JDOObjectNotFoundException e) {
				throw new UnauthorizedException("User is not registered");
			}

		} finally {
			mgr.close();
		}
		return project;
	}

	/**
	 * This method is used for updating an existing entity. If the entity does not
	 * exist in the datastore, an exception is thrown.
	 * It uses HTTP PUT method.
	 *
	 * @param project the entity to be updated.
	 * @return The updated entity.
	 * @throws UnauthorizedException
	 */
	@ApiMethod(name = "project.updateProject")
	public AbstractProject updateProject(AbstractProject project, User user) throws UnauthorizedException {
		// Check if user is authorized
		// Authorization.checkAuthorization(project, user);

		PersistenceManager mgr = getPersistenceManager();
		try {
			// FIXME check if project exists
			// if (!containsProject(project)) {
			// throw new EntityNotFoundException("Object does not exist");
			// }
			Cache.cache(project.getId(), project.getClass(), project);
			mgr.makePersistent(project);
		} finally {
			mgr.close();
		}
		return project;
	}

	@ApiMethod(name = "project.addOwner")
	public Project addOwner(@Named("projectID") Long projectID, @Nullable @Named("userID") String userID, User user) throws UnauthorizedException {

		com.qdacity.user.User qdacityUser = userEndpoint.getCurrentUser(user); // also checks if user is registered
		
		Project project = null;
		PersistenceManager mgr = getPersistenceManager();
		try {
			project = (Project) Cache.getOrLoad(projectID, Project.class);
			if (userID != null) project.addOwner(userID);
			else project.addOwner(qdacityUser.getId());
			
			qdacityUser.addProjectAuthorization(projectID);

			mgr.makePersistent(project);
			Cache.cache(projectID, Project.class, project);
			mgr.makePersistent(qdacityUser);
			
			Cache.cache(qdacityUser.getId(), com.qdacity.user.User.class, qdacityUser);
			AuthenticatedUser authenticatedUser = (AuthenticatedUser) user;
			Cache.cacheAuthenticatedUser(authenticatedUser, qdacityUser); // also cache external user id
		} finally {
			mgr.close();
		}
		return project;
	}

	@ApiMethod(name = "project.addCoder")
	public Project addCoder(@Named("projectID") Long projectID, @Nullable @Named("userID") String userID, User user) throws UnauthorizedException {

		com.qdacity.user.User qdacityUser = userEndpoint.getCurrentUser(user); // also checks if user is registered
		
		Project project = null;
		PersistenceManager mgr = getPersistenceManager();
		try {
			project = (Project) Cache.getOrLoad(projectID, Project.class);
			if (userID != null) project.addCoder(userID);
			else project.addCoder(qdacityUser.getId());
			Cache.cache(projectID, Project.class, project);
			mgr.makePersistent(project);
		} finally {
			mgr.close();
		}
		return project;
	}

	@ApiMethod(name = "project.addValidationCoder")
	public Project addValidationCoder(@Named("projectID") Long projectID, @Nullable @Named("userID") String userID, User user) throws UnauthorizedException {

		com.qdacity.user.User qdacityUser = userEndpoint.getCurrentUser(user); // also checks if user is registered
		
		Project project = null;
		PersistenceManager mgr = getPersistenceManager();
		try {
			project = (Project) Cache.getOrLoad(projectID, Project.class);
			if (userID != null) project.addValidationCoder(userID);
			else project.addValidationCoder(qdacityUser.getId());
			Cache.cache(projectID, Project.class, project);
			mgr.makePersistent(project);
		} finally {
			mgr.close();
		}
		return project;
	}

	@ApiMethod(name = "project.removeUser")
	public void removeUser(@Named("projectID") Long projectID, @Named("projectType") String projectType, @Nullable @Named("userID") String userID, User user) throws UnauthorizedException {

		com.qdacity.user.User qdacityUser = userEndpoint.getCurrentUser(user); // also checks if user is registered
		
		PersistenceManager mgr = getPersistenceManager();
		try {
			String userIdToRemove = "";

			if (userID != null) userIdToRemove = userID;
			else userIdToRemove = qdacityUser.getId();

			if (projectType.equals("PROJECT")) {
				Project project = (Project) Cache.getOrLoad(projectID, Project.class);
				if (project != null) { // if false -> bug.
					project.removeUser(userIdToRemove);
					Cache.cache(projectID, Project.class, project);
					mgr.makePersistent(project);
				}

				com.qdacity.user.User dbUser = mgr.getObjectById(com.qdacity.user.User.class, userIdToRemove);
				dbUser.removeProjectAuthorization(projectID);
				mgr.makePersistent(dbUser);
			} else if (projectType.equals("VALIDATION")) {
				ValidationProject project = mgr.getObjectById(ValidationProject.class, projectID);
				Logger.getLogger("logger").log(Level.INFO, "ValidationCoders: " + project.getValidationCoders().toString());
				Cache.cache(projectID, Project.class, project);
				project.removeValidationCoder(userIdToRemove);
				mgr.makePersistent(project);
				Logger.getLogger("logger").log(Level.INFO, "ValidationCoders: " + project.getValidationCoders().toString());
			}

		} finally {
			mgr.close();
		}
	}

	@ApiMethod(name = "project.inviteUser")
	public Project inviteUser(@Named("projectID") Long projectID, @Named("userEmail") String userEmail, User user) throws UnauthorizedException {

		com.qdacity.user.User qdacityUser = userEndpoint.getCurrentUser(user); // also checks if user is registered
		
		Project project = null;
		PersistenceManager mgr = getPersistenceManager();
		try {

			// Get the invited user
			Query q = mgr.newQuery(com.qdacity.user.User.class, "email == '" + userEmail + "'");
			@SuppressWarnings("unchecked")
			List<com.qdacity.user.User> dbUsers = (List<com.qdacity.user.User>) q.execute();
			String userID = dbUsers.get(0).getId();

			// Get the inviting user
			com.qdacity.user.User invitingUser = qdacityUser;

			// Insert user into project as invited user
			project = (Project) Cache.getOrLoad(projectID, Project.class);
			project.addInvitedUser(qdacityUser.getId());
			Cache.cache(projectID, Project.class, project);
			mgr.makePersistent(project);

			// Create notification
			UserNotification notification = new UserNotification();
			notification.setDatetime(new Date());
			notification.setMessage("Project: " + project.getName());
			notification.setSubject("Invitation by <b>" + invitingUser.getGivenName() + " " + invitingUser.getSurName() + "</b>");
			notification.setOriginUser(qdacityUser.getId());
			notification.setProject(projectID);
			notification.setSettled(false);
			notification.setType(UserNotificationType.INVITATION);
			notification.setUser(userID.toString());

			mgr.makePersistent(notification);

		} finally {
			mgr.close();
		}
		return project;
	}

	@ApiMethod(name = "project.setDescription")
	public AbstractProject setDescription(@Named("projectID") Long projectID, @Named("projectType") String projectType, @Named("description") String description, User user) throws UnauthorizedException {
		AbstractProject project = null;
		PersistenceManager mgr = getPersistenceManager();
		try {
			ProjectType.PROJECT.toString();
			// FIXME handle authorization
			// FIXME handle project types differently
			if (projectType.equals(ProjectType.PROJECT.toString())) {
				project = (Project) Cache.getOrLoad(projectID, Project.class);
			} else if (projectType.equals(ProjectType.VALIDATION.toString())) {
				project = mgr.getObjectById(ValidationProject.class, projectID);
			}

			project.setDescription(description);
			Cache.cache(projectID, project.getClass(), project);
			project = mgr.makePersistent(project);

		} finally {
			mgr.close();
		}
		return project;
	}

	@ApiMethod(name = "project.setUmlEditorEnabled")
	public AbstractProject setUmlEditorEnabled(@Named("projectID") Long projectID, @Named("projectType") String projectType, @Named("umlEditorEnabled") boolean umlEditorEnabled, User user) throws UnauthorizedException {
		AbstractProject project = null;
		PersistenceManager mgr = getPersistenceManager();
		try {
			ProjectType.PROJECT.toString();
			// FIXME handle authorization

			if (projectType.equals(ProjectType.PROJECT.toString())) {
				project = (Project) Cache.getOrLoad(projectID, Project.class);
			} else if (projectType.equals(ProjectType.VALIDATION.toString())) {
				project = mgr.getObjectById(ValidationProject.class, projectID);
			}

			project.setUmlEditorEnabled(umlEditorEnabled);
			Cache.cache(projectID, project.getClass(), project);
			project = mgr.makePersistent(project);

		} finally {
			mgr.close();
		}
		return project;
	}	
	
	@ApiMethod(name = "project.createSnapshot")
	public ProjectRevision createSnapshot(@Named("projectID") Long projectID, @Named("comment") String comment, User user) throws UnauthorizedException {
		ProjectRevision cloneProject = null;
		PersistenceManager mgr = getPersistenceManager();
		try {
			Project project = (Project) Cache.getOrLoad(projectID, Project.class);

			cloneProject = new ProjectRevision(cloneProject(project, user), project.getId(), comment);

			project.setRevision(project.getRevision() + 1);

			cloneProject = mgr.makePersistent(cloneProject);

			Cache.cache(project.getId(), Project.class, project);
			project = mgr.makePersistent(project);

			// Set the ID that was just generated
			CodeSystemEndpoint.setProject(cloneProject.getCodesystemID(), cloneProject.getId());

			TextDocumentEndpoint.cloneTextDocuments(project, ProjectType.REVISION, cloneProject.getId(), false, user);
			
			//Every time a new Project revision is created a new Saturation needs to be calculated.
			SaturationEndpoint se = new SaturationEndpoint();
			se.calculateNewSaturation(projectID, user); //asynchronous, so request doesn't take too long.
		} finally {
			mgr.close();
		}

		return cloneProject;
	}

	@ApiMethod(name = "project.requestValidationAccess")
	public ValidationProject requestValidationAccess(@Named("revisionID") Long revisionID, User user) throws UnauthorizedException {

		com.qdacity.user.User qdacityUser = userEndpoint.getCurrentUser(user); // also checks if user is registered
		
		ProjectRevision projectRevision = null;
		Project project = null;
		ValidationProject cloneProject = null;
		PersistenceManager mgr = getPersistenceManager();
		try {
			projectRevision = mgr.getObjectById(ProjectRevision.class, revisionID);
			project = (Project) Cache.getOrLoad(projectRevision.getProjectID(), Project.class);
			// Get the inviting user
			com.qdacity.user.User requestingUser = qdacityUser;

			// Create notification
			List<String> owners = project.getOwners();

			for (String owner : owners) {
				UserNotification notification = new UserNotification();
				notification.setDatetime(new Date());
				notification.setMessage(project.getName() + " (Revision " + projectRevision.getRevision() + " )");
				notification.setSubject("Validation request by <b>" + requestingUser.getGivenName() + " " + requestingUser.getSurName() + "</b>");
				notification.setOriginUser(qdacityUser.getId());
				notification.setProject(revisionID);
				notification.setSettled(false);
				notification.setType(UserNotificationType.VALIDATION_REQUEST);
				notification.setUser(owner);

				mgr.makePersistent(notification);
			}

			UserNotification notification = new UserNotification();
			notification.setDatetime(new Date());
			notification.setMessage(project.getName() + " (Revision " + projectRevision.getRevision() + " )");
			notification.setSubject("You have requiested access");
			notification.setOriginUser(qdacityUser.getId());
			notification.setProject(revisionID);
			notification.setSettled(false);
			notification.setType(UserNotificationType.POSTED_VALIDATION_REQUEST);
			notification.setUser(qdacityUser.getId());

			mgr.makePersistent(notification);

		} finally {
			mgr.close();
		}
		return cloneProject;
	}

	@ApiMethod(name = "project.createValidationProject")
	public ValidationProject createValidationProject(@Named("projectID") Long revisionID, @Named("userID") String userID, User user) throws UnauthorizedException, JSONException {

		com.qdacity.user.User qdacityUser = userEndpoint.getCurrentUser(user); // also checks if user is registered
		
		ProjectRevision project = null;
		ValidationProject cloneProject = null;
		PersistenceManager mgr = getPersistenceManager();
		try {
			project = mgr.getObjectById(ProjectRevision.class, revisionID);

			cloneProject = createValidationProject(project, user);

			cloneProject.addValidationCoder(userID);
			com.qdacity.user.User validationCoder = mgr.getObjectById(com.qdacity.user.User.class, userID);

			cloneProject.setCreatorName(validationCoder.getGivenName() + " " + validationCoder.getSurName());
			// cloneProject.setRevisionID(project.getId());// FIXME Check why this works and previous assignments dont

			cloneProject = mgr.makePersistent(cloneProject);
			project = mgr.makePersistent(project);

			TextDocumentEndpoint.cloneTextDocuments(project, ProjectType.VALIDATION, cloneProject.getId(), true, user);

			// Notify user of accepted request
			UserNotification notification = new UserNotification();
			notification.setDatetime(new Date());
			notification.setMessage(project.getName() + " (Revision " + project.getRevision() + " )");
			notification.setSubject("Your request was granted");
			notification.setOriginUser(qdacityUser.getId());
			notification.setProject(revisionID);
			notification.setSettled(false);
			notification.setType(UserNotificationType.VALIDATION_REQUEST_GRANTED);
			notification.setUser(userID);

			mgr.makePersistent(notification);

			sendEmailNotification(project, validationCoder);

		} finally {
			mgr.close();
		}
		return cloneProject;
	}

	private void sendEmailNotification(ProjectRevision project, com.qdacity.user.User validationCoder) throws JSONException {
		Sendgrid mail = new Sendgrid(Credentials.SENDGRID_USER, Credentials.SENDGRID_PW);

		String message = "Dear " + validationCoder.getGivenName() + ", \n";
		message += "Your request has been authorized, you may now code the data of project " + project.getName() + "\n";

		// FIXME project number
		mail.setFrom("QDAcity <support@qdacity.com>").setSubject("QDAcity Request Authorized").setText(" ").setHtml(message);

		String fullName = validationCoder.getGivenName() + " " + validationCoder.getSurName();
		// FIXME remove non-ascii characters from name
		// fullName = fullName.replaceAll("ae", "ae").replaceAll("ae", "oe").replaceAll("ae", "ue");
		mail.addTo(validationCoder.getEmail(), fullName);

		mail.send();
		Logger.getLogger("logger").log(Level.INFO, mail.getServerResponse());

	}

	@ApiMethod(name = "project.listRevisions")
	public List<ProjectRevision> listRevisions(@Named("projectID") Long projectID, User user) throws UnauthorizedException {
		List<ProjectRevision> revisions = null;
		PersistenceManager mgr = getPersistenceManager();
		try {

			Query q;
			q = mgr.newQuery(ProjectRevision.class, " projectID  == :projectID");

			Map<String, Long> params = new HashMap<String, Long>();
			params.put("projectID", projectID);

			@SuppressWarnings("unchecked")
			List<ProjectRevision> snapshots = (List<ProjectRevision>) q.executeWithMap(params);
			Collections.sort(snapshots, new RevisionComparator()); // Sort by revision number

			Query validationQuery = mgr.newQuery(ValidationProject.class, " projectID  == :projectID");
			@SuppressWarnings("unchecked")
			List<ValidationProject> validationProjects = (List<ValidationProject>) validationQuery.executeWithMap(params);
			revisions = new ArrayList<ProjectRevision>();

			revisions.addAll(validationProjects);
			revisions.addAll(snapshots);

		} finally {
			mgr.close();
		}
		return revisions;
	}
	
	@ApiMethod(name = "project.listRevisionsExcludingValidation",
			path = "exercises",
			scopes = { Constants.EMAIL_SCOPE },
			clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
			audiences = { Constants.WEB_CLIENT_ID })
		public List<ProjectRevision> listRevisionsForExerciseProject(@Named("projectID") Long projectID, User user) throws UnauthorizedException {
			List<ProjectRevision> revisions = new ArrayList<ProjectRevision>();
			PersistenceManager mgr = getPersistenceManager();
			try {

				Query q;
				q = mgr.newQuery(ProjectRevision.class, " projectID  == :projectID");

				Map<String, Long> params = new HashMap<String, Long>();
				params.put("projectID", projectID);

				@SuppressWarnings("unchecked")
				List<ProjectRevision> snapshots = (List<ProjectRevision>) q.executeWithMap(params);
				Collections.sort(snapshots, new RevisionComparator()); // Sort by revision number

				revisions.addAll(snapshots);

			} finally {
				mgr.close();
			}
			return revisions;
		}

	/**
	 * This method removes the entity with primary key id.
	 * It uses HTTP DELETE method.
	 *
	 * @param id the primary key of the entity to be deleted.
	 * @throws UnauthorizedException
	 */
	@SuppressWarnings("unchecked")
	@ApiMethod(name = "project.removeProject")
	public void removeProject(@Named("id") Long id, User user) throws UnauthorizedException {
		PersistenceManager mgr = getPersistenceManager();
		try {
			Project project = (Project) mgr.getObjectById(Project.class, id);

			if(!Authorization.isUserAdmin(user)) {
				// Check if user is authorized
				Authorization.checkAuthorization(project, user);
			} // else he is admin and also privileged

			List<String> userIDs = project.getOwners();

			for (String projectUserIDs : userIDs) {
				com.qdacity.user.User projectUser = mgr.getObjectById(com.qdacity.user.User.class, projectUserIDs);
				projectUser.removeProjectAuthorization(id);
				mgr.makePersistent(projectUser);
			}

			// remove user groups
			for (Long userGroupId: project.getOwningUserGroups()) {
				UserGroup userGroup = (UserGroup) Cache.getOrLoad(userGroupId, UserGroup.class);
				userGroup.getProjects().remove(id);
				mgr.makePersistent(userGroup);
				Cache.cache(userGroupId, UserGroup.class, userGroup);
			}

			Long codeSystemID = project.getCodesystemID();
			Query q;

			// Delete code system
			PersistenceManager mgr2 = getPersistenceManager();
			try {

				CodeSystem codeSystem = mgr2.getObjectById(CodeSystem.class, codeSystemID);

				q = mgr2.newQuery(Code.class, " codesystemID  == :codeSystemID");
				// q.deletePersistentAll();
				Map<String, Long> codesParam = new HashMap<String, Long>();
				codesParam.put("codeSystemID", codeSystem.getId());
				List<Code> codes = (List<Code>) q.executeWithMap(codesParam);
				mgr2.deletePersistentAll(codes);

				mgr2.deletePersistent(codeSystem);
			} catch (JDOObjectNotFoundException e) {
				java.util.logging.Logger.getLogger("logger").log(Level.WARNING, " Could not delete codesystem " + codeSystemID);
			} finally {
				mgr2.close();
			}

			// Delete all documents

			q = mgr.newQuery(TextDocument.class);
			q.setFilter("projectID == :theID");
			Map<String, Long> paramValues = new HashMap<String, Long>();
			paramValues.put("theID", id);
			mgr.deletePersistentAll((List<TextDocument>) q.executeWithMap(paramValues));

			// Delete Revisions incl ValidationProjects
			Query query = mgr.newQuery(ProjectRevision.class);

			query.setFilter("projectID == :theID");
			Map<String, Long> revisionParams = new HashMap<String, Long>();
			revisionParams.put("theID", id);

			List<ProjectRevision> execute = (List<ProjectRevision>) query.executeWithMap(revisionParams);
			for (ProjectRevision projectRevision : execute) {
				this.removeProjectRevision(projectRevision.getId(), user);
			}

			// Finally remove the actual project
			mgr.deletePersistent(project);
		} finally {
			mgr.close();
		}
	}

	/**
	 * This method removes the entity with primary key id.
	 * It uses HTTP DELETE method.
	 *
	 * @param id the primary key of the entity to be deleted.
	 * @throws UnauthorizedException
	 */
	@ApiMethod(name = "project.removeProjectRevision")
	public void removeProjectRevision(@Named("id") Long id, User user) throws UnauthorizedException {
		PersistenceManager mgr = getPersistenceManager();
		try {
			ProjectRevision project = mgr.getObjectById(ProjectRevision.class, id);
			// Check if user is authorized
			Authorization.checkAuthorization(project.getProjectID(), user);

			// remove all ValidationProjects associated with this revision
			removeAllValidationProjects(id);

			Long codeSystemID = project.getCodesystemID();

			mgr.deletePersistent(project);

			// Delete code system
			CodeSystem codeSystem = mgr.getObjectById(CodeSystem.class, codeSystemID);

			Query q;
			q = mgr.newQuery(Code.class, " codesystemID  == :codeSystemID");
			// q.deletePersistentAll();
			Map<String, Long> codesParam = new HashMap<String, Long>();
			codesParam.put("codeSystemID", codeSystem.getId());
			@SuppressWarnings("unchecked")
			List<Code> codes = (List<Code>) q.executeWithMap(codesParam);
			mgr.deletePersistentAll(codes);

			mgr.deletePersistent(codeSystem);

			// Delete all documents

			q = mgr.newQuery(TextDocument.class);
			q.setFilter("projectID == :theID");
			Map<String, Long> paramValues = new HashMap<String, Long>();
			paramValues.put("theID", id);
			@SuppressWarnings("unchecked")
			List<TextDocument> textDocuments = (List<TextDocument>) q.executeWithMap(paramValues);
			mgr.deletePersistentAll(textDocuments);

		} finally {
			mgr.close();
		}
	}

	/**
	 * This method removes the entity with primary key id.
	 * It uses HTTP DELETE method.
	 *
	 * @param id the primary key of the entity to be deleted.
	 * @throws UnauthorizedException
	 */
	@ApiMethod(name = "project.removeValidationProject")
	public void removeValidationProject(@Named("id") Long id, User user) throws UnauthorizedException {
		PersistenceManager mgr = getPersistenceManager();
		try {
			ValidationProject project = mgr.getObjectById(ValidationProject.class, id);
			// Check if user is authorized
			// Authorization.checkAuthorization(project.getProjectID(), user);

			// Long codeSystemID = project.getCodesystemID();


			removeAssociatedData(project);
			mgr.deletePersistent(project);

		} finally {
			mgr.close();
		}
	}

	/**
	 * This method removes the entity with primary key id.
	 * It uses HTTP DELETE method.
	 *
	 * @param id the primary key of the entity to be deleted.
	 * @throws UnauthorizedException
	 */
	@ApiMethod(name = "project.removeExerciseProject", path = "exercises")
	public void removeExerciseProject(@Named("id") Long id, User user) throws UnauthorizedException {
		PersistenceManager mgr = getPersistenceManager();
		try {
			ExerciseProject project = mgr.getObjectById(ExerciseProject.class, id);
			// Check if user is authorized
			// Authorization.checkAuthorization(project.getProjectID(), user);

			// Long codeSystemID = project.getCodesystemID();


			removeAssociatedData(project);
			mgr.deletePersistent(project);

		} finally {
			mgr.close();
		}
	}

	private void removeAllValidationProjects(Long revisionId) {
		PersistenceManager mgr = getPersistenceManager();
		try {
			Query q;
			q = mgr.newQuery(ValidationProject.class, " revisionID  == :revisionID");
			Map<String, Long> codesParam = new HashMap<String, Long>();
			codesParam.put("revisionID", revisionId);

			@SuppressWarnings("unchecked")
			List<ValidationProject> validationProjects = (List<ValidationProject>) q.executeWithMap(codesParam);

			for (ValidationProject validationProject : validationProjects) {
				removeAssociatedData(validationProject);
				mgr.deletePersistent(validationProject);
			}

		} finally {
			mgr.close();
		}
	}

	@SuppressWarnings("unchecked")
	private void removeAssociatedData(ProjectRevision project) {
		PersistenceManager mgr = getPersistenceManager();
		try {
			// Delete all documents

			Query q = mgr.newQuery(TextDocument.class);
			q.setFilter("projectID == :theID");
			Map<String, Long> paramValues = new HashMap<String, Long>();
			paramValues.put("theID", project.getId());
			mgr.deletePersistentAll((List<TextDocument>) q.executeWithMap(paramValues));

		} finally {
			mgr.close();
		}
	}

	private Project cloneProject(Project project, User user) throws UnauthorizedException {

		Project cloneProject = new Project(project);
		CodeSystem codeSystemClone = CodeSystemEndpoint.cloneCodeSystem(project.getCodesystemID(), project.getId(), ProjectType.REVISION, user);

		cloneProject.setCodesystemID(codeSystemClone.getId());

		return cloneProject;

	}

	private ValidationProject createValidationProject(ProjectRevision projectRev, User user) throws UnauthorizedException {

		ValidationProject cloneProject = new ValidationProject(projectRev);

		cloneProject.setCodesystemID(projectRev.getCodesystemID());

		return cloneProject;

	}

	private boolean containsProject(Project project) {
		PersistenceManager mgr = getPersistenceManager();
		boolean contains = true;
		try {
			mgr.getObjectById(Project.class, project.getId());
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
