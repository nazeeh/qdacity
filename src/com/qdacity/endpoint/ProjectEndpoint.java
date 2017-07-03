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

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.response.CollectionResponse;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.memcache.MemcacheService;
import com.google.appengine.api.taskqueue.Queue;
import com.google.appengine.api.taskqueue.QueueFactory;
import com.google.appengine.api.users.User;
import com.google.appengine.labs.repackaged.org.json.JSONException;
import com.qdacity.Authorization;
import com.qdacity.Cache;
import com.qdacity.Constants;
import com.qdacity.Credentials;
import com.qdacity.PMF;
import com.qdacity.Sendgrid;
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
		packagePath = "server.project"))
public class ProjectEndpoint {

	/**
	 * This method lists all the entities inserted in datastore.
	 * It uses HTTP GET method and paging support.
	 *
	 * @return A CollectionResponse class containing the list of all entities
	 *         persisted and a cursor to the next page.
	 * @throws UnauthorizedException
	 */
	@SuppressWarnings({ "unchecked", "unused" })
	@ApiMethod(name = "project.listProject",
		path = "projects",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public CollectionResponse<Project> listProject(@Nullable @Named("cursor") String cursorString, @Nullable @Named("limit") Integer limit, User user) throws UnauthorizedException {

		if (user == null) throw new UnauthorizedException("User not authorized"); // TODO currently no user is authorized to list all projects

		PersistenceManager mgr = null;
		List<Project> execute = null;

		try {
			mgr = getPersistenceManager();

			Query q = mgr.newQuery(Project.class, ":p.contains(owners)");

			execute = (List<Project>) q.execute(Arrays.asList(user.getUserId()));

			// Tight loop for fetching all entities from datastore and accomodate
			// for lazy fetch.
			for (Project obj : execute);
		} finally {
			mgr.close();
		}

		return CollectionResponse.<Project> builder().setItems(execute).setNextPageToken(cursorString).build();
	}

	@SuppressWarnings("unchecked")
	@ApiMethod(name = "project.listValidationProject",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public List<ValidationProject> listValidationProject(User user) throws UnauthorizedException {

		if (user == null) throw new UnauthorizedException("User not authorized"); // TODO user unknown

		PersistenceManager mgr = getPersistenceManager();
		List<ValidationProject> execute = null;

		try {

			Query q = mgr.newQuery(ValidationProject.class, ":p.contains(validationCoders)");

			execute = (List<ValidationProject>) q.execute(Arrays.asList(user.getUserId()));

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
	@ApiMethod(name = "project.getProject",
		path = "project",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public AbstractProject getProject(@Named("id") Long id, @Named("type") String type, User user) throws UnauthorizedException {
		PersistenceManager mgr = getPersistenceManager();
		AbstractProject project = null;
		try {
			java.util.logging.Logger.getLogger("logger").log(Level.INFO, " Getting Project " + id);

			Authorization.isUserNotNull(user);
			com.qdacity.user.User dbUser = mgr.getObjectById(com.qdacity.user.User.class, user.getUserId());

			if (dbUser.getLastProjectId() != id) { // Check if lastProject property of user has to be updated
				// Update User async TODO: check if actually faster than saving directly
				LastProjectUsed task = new LastProjectUsed(dbUser, id, ProjectType.valueOf(type));
				Queue queue = QueueFactory.getDefaultQueue();
				queue.add(com.google.appengine.api.taskqueue.TaskOptions.Builder.withPayload(task));
			}

			String keyString;
			MemcacheService syncCache;
			switch (type) {
				case "VALIDATION":
					project = (ValidationProject) Cache.getOrLoad(id, ValidationProject.class);
					Authorization.checkAuthorization((ValidationProject) project, dbUser); // FIXME rethink authorization needs. Consider public projects where the basic info can be accessed, but not changed, by everyone.
					break;
				case "REVISION":

					project = (ProjectRevision) Cache.getOrLoad(id, ProjectRevision.class);
					// Authorization.checkAuthorization((ValidationProject)project, dbUser); // FIXME rethink authorization needs. Consider public projects where the basic info can be accessed, but not changed, by everyone.
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
	@ApiMethod(name = "project.incrCodingId",
		path = "codings",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public AbstractProject getAndIncrCodingId(@Named("id") Long projectID, @Named("type") String type, User user) throws UnauthorizedException {
		PersistenceManager mgr = getPersistenceManager();
		AbstractProject project = null;
		try {
			switch (type) {
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
	@ApiMethod(name = "project.insertProject",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public Project insertProject(Project project, User user) throws UnauthorizedException {
		// Check if user is authorized
		// Authorization.checkAuthorization(project, user); // FIXME does not make sense for inserting new projects - only check if user is in DB already

		PersistenceManager mgr = getPersistenceManager();
		try {
			if (project.getId() != null) {
				if (containsProject(project)) {
					throw new EntityExistsException("Object already exists");
				}
			}
			project.addOwner(user.getUserId());
			project.setRevision(0);
			mgr.makePersistent(project);
			// Authorize User
			com.qdacity.user.User dbUser = mgr.getObjectById(com.qdacity.user.User.class, user.getUserId());
			dbUser.addProjectAuthorization(project.getId());
			Cache.cache(dbUser.getId(), com.qdacity.user.User.class, dbUser);
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
	@ApiMethod(name = "project.updateProject",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
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

	@ApiMethod(name = "project.addOwner",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public Project addOwner(@Named("projectID") Long projectID, @Nullable @Named("userID") String userID, User user) throws UnauthorizedException {
		Project project = null;
		PersistenceManager mgr = getPersistenceManager();
		try {
			project = (Project) Cache.getOrLoad(projectID, Project.class);
			if (userID != null) project.addOwner(userID);
			else project.addOwner(user.getUserId());

			com.qdacity.user.User dbUser = mgr.getObjectById(com.qdacity.user.User.class, user.getUserId());
			dbUser.addProjectAuthorization(projectID);

			mgr.makePersistent(project);
			Cache.cache(projectID, Project.class, project);
			mgr.makePersistent(dbUser);
			Cache.cache(user.getUserId(), com.qdacity.user.User.class, dbUser);

		} finally {
			mgr.close();
		}
		return project;
	}

	@ApiMethod(name = "project.addCoder",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public Project addCoder(@Named("projectID") Long projectID, @Nullable @Named("userID") String userID, User user) throws UnauthorizedException {
		Project project = null;
		PersistenceManager mgr = getPersistenceManager();
		try {
			project = (Project) Cache.getOrLoad(projectID, Project.class);
			if (userID != null) project.addCoder(userID);
			else project.addCoder(user.getUserId());
			Cache.cache(projectID, Project.class, project);
			mgr.makePersistent(project);
		} finally {
			mgr.close();
		}
		return project;
	}

	@ApiMethod(name = "project.addValidationCoder",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public Project addValidationCoder(@Named("projectID") Long projectID, @Nullable @Named("userID") String userID, User user) throws UnauthorizedException {
		Project project = null;
		PersistenceManager mgr = getPersistenceManager();
		try {
			project = (Project) Cache.getOrLoad(projectID, Project.class);
			if (userID != null) project.addValidationCoder(userID);
			else project.addValidationCoder(user.getUserId());
			Cache.cache(projectID, Project.class, project);
			mgr.makePersistent(project);
		} finally {
			mgr.close();
		}
		return project;
	}

	@ApiMethod(name = "project.removeUser",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public void removeUser(@Named("projectID") Long projectID, @Named("projectType") String projectType, @Nullable @Named("userID") String userID, User user) throws UnauthorizedException {

		PersistenceManager mgr = getPersistenceManager();
		try {
			String userIdToRemove = "";

			if (userID != null) userIdToRemove = userID;
			else userIdToRemove = user.getUserId();

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

	@ApiMethod(name = "project.inviteUser",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public Project inviteUser(@Named("projectID") Long projectID, @Named("userEmail") String userEmail, User user) throws UnauthorizedException {
		Project project = null;
		PersistenceManager mgr = getPersistenceManager();
		try {

			// Get the invited user
			Query q = mgr.newQuery(com.qdacity.user.User.class, "email == '" + userEmail + "'");
			@SuppressWarnings("unchecked")
			List<com.qdacity.user.User> dbUsers = (List<com.qdacity.user.User>) q.execute();
			String userID = dbUsers.get(0).getId();

			// Get the inviting user
			com.qdacity.user.User invitingUser = mgr.getObjectById(com.qdacity.user.User.class, user.getUserId());

			// Insert user into project as invited user
			project = (Project) Cache.getOrLoad(projectID, Project.class);
			project.addInvitedUser(user.getUserId());
			Cache.cache(projectID, Project.class, project);
			mgr.makePersistent(project);

			// Create notification
			UserNotification notification = new UserNotification();
			notification.setDatetime(new Date());
			notification.setMessage("Project: " + project.getName());
			notification.setSubject("Invitation by <b>" + invitingUser.getGivenName() + " " + invitingUser.getSurName() + "</b>");
			notification.setOriginUser(user.getUserId());
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

	@ApiMethod(name = "project.setDescription",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
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

	@ApiMethod(name = "project.setUmlEditorEnabled",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
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
	
	@ApiMethod(name = "project.createSnapshot",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
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

			TextDocumentEndpoint.cloneTextDocuments(project, cloneProject.getId(), false, user);
		} finally {
			mgr.close();
		}

		return cloneProject;
	}

	@ApiMethod(name = "project.requestValidationAccess",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public ValidationProject requestValidationAccess(@Named("revisionID") Long revisionID, User user) throws UnauthorizedException {
		ProjectRevision projectRevision = null;
		Project project = null;
		ValidationProject cloneProject = null;
		PersistenceManager mgr = getPersistenceManager();
		try {
			projectRevision = mgr.getObjectById(ProjectRevision.class, revisionID);
			project = (Project) Cache.getOrLoad(projectRevision.getProjectID(), Project.class);
			// Get the inviting user
			com.qdacity.user.User requestingUser = mgr.getObjectById(com.qdacity.user.User.class, user.getUserId());

			// Create notification
			List<String> owners = project.getOwners();

			for (String owner : owners) {
				UserNotification notification = new UserNotification();
				notification.setDatetime(new Date());
				notification.setMessage(project.getName() + " (Revision " + projectRevision.getRevision() + " )");
				notification.setSubject("Validation request by <b>" + requestingUser.getGivenName() + " " + requestingUser.getSurName() + "</b>");
				notification.setOriginUser(user.getUserId());
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
			notification.setOriginUser(user.getUserId());
			notification.setProject(revisionID);
			notification.setSettled(false);
			notification.setType(UserNotificationType.POSTED_VALIDATION_REQUEST);
			notification.setUser(user.getUserId());

			mgr.makePersistent(notification);

		} finally {
			mgr.close();
		}
		return cloneProject;
	}

	@ApiMethod(name = "project.createValidationProject",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public ValidationProject createValidationProject(@Named("projectID") Long revisionID, @Named("userID") String userID, User user) throws UnauthorizedException, JSONException {
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

			TextDocumentEndpoint.cloneTextDocuments(project, cloneProject.getId(), true, user);

			// Notify user of accepted request
			UserNotification notification = new UserNotification();
			notification.setDatetime(new Date());
			notification.setMessage(project.getName() + " (Revision " + project.getRevision() + " )");
			notification.setSubject("Your request was granted");
			notification.setOriginUser(user.getUserId());
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
		fullName = fullName.replaceAll("�", "ae").replaceAll("�", "oe").replaceAll("�", "ue");
		mail.addTo(validationCoder.getEmail(), fullName);

		mail.send();
		Logger.getLogger("logger").log(Level.INFO, mail.getServerResponse());

	}

	@ApiMethod(name = "project.listRevisions",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
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

	/**
	 * This method removes the entity with primary key id.
	 * It uses HTTP DELETE method.
	 *
	 * @param id the primary key of the entity to be deleted.
	 * @throws UnauthorizedException
	 */
	@SuppressWarnings("unchecked")
	@ApiMethod(name = "project.removeProject",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public void removeProject(@Named("id") Long id, User user) throws UnauthorizedException {
		PersistenceManager mgr = getPersistenceManager();
		try {
			Project project = (Project) mgr.getObjectById(Project.class, id);

			// Check if user is authorized
			Authorization.checkAuthorization(project, user);

			List<String> userIDs = project.getOwners();

			for (String projectUserIDs : userIDs) {
				com.qdacity.user.User projectUser = mgr.getObjectById(com.qdacity.user.User.class, projectUserIDs);

				projectUser.removeProjectAuthorization(id);
				mgr.makePersistent(projectUser);

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
	@ApiMethod(name = "project.removeProjectRevision",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
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
	@ApiMethod(name = "project.removeValidationProject",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
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
	private void removeAssociatedData(ValidationProject project) {
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
	
	public Long getCodesystemId(Long projectId) {
	    	Project project = (Project) Cache.getOrLoad(projectId, Project.class);;
		return project.getCodesystemID();
	}

}
