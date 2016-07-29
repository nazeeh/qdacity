package com.qdacity.server.project;

import com.qdacity.Constants;
import com.qdacity.server.Authorization;
import com.qdacity.server.PMF;
import com.qdacity.server.user.UserNotification;
import com.qdacity.server.user.UserNotificationType;
import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.response.CollectionResponse;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.datastore.Cursor;
import com.google.appengine.api.users.User;
import com.google.appengine.datanucleus.query.JDOCursorHelper;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Nullable;
import javax.inject.Named;
import javax.persistence.EntityExistsException;
import javax.persistence.EntityNotFoundException;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;

@Api(name = "qdacity", namespace = @ApiNamespace(ownerDomain = "qdacity.com", ownerName = "qdacity.com", packagePath = "server.project"))
public class ProjectEndpoint {

	/**
	 * This method lists all the entities inserted in datastore.
	 * It uses HTTP GET method and paging support.
	 *
	 * @return A CollectionResponse class containing the list of all entities
	 * persisted and a cursor to the next page.
	 * @throws UnauthorizedException 
	 */
	@SuppressWarnings({ "unchecked", "unused" })
	@ApiMethod(name = "project.listProject", path="projects",  scopes = {Constants.EMAIL_SCOPE},
			clientIds = {Constants.WEB_CLIENT_ID, 
		     com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
		     audiences = {Constants.WEB_CLIENT_ID})
	public CollectionResponse<Project> listProject(
			@Nullable @Named("cursor") String cursorString,
			@Nullable @Named("limit") Integer limit, User user) throws UnauthorizedException {
		
		if (user == null) throw new UnauthorizedException("User not authorized"); // TODO currently no user is authorized to list all projects

		PersistenceManager mgr = null;
		Cursor cursor = null;
		List<Project> execute = null;

		try {
			mgr = getPersistenceManager();
			
			com.qdacity.server.user.User dbUser = mgr.getObjectById(com.qdacity.server.user.User.class, user.getUserId());

			
			Query q = mgr.newQuery(Project.class, ":p.contains(owners)");
			
			
			Query query = mgr.newQuery(Project.class, ":p.contains(owners)");
			if (cursorString != null && cursorString != "") {
				cursor = Cursor.fromWebSafeString(cursorString);
				HashMap<String, Object> extensionMap = new HashMap<String, Object>();
				extensionMap.put(JDOCursorHelper.CURSOR_EXTENSION, cursor);
				query.setExtensions(extensionMap);
			}

			if (limit != null) {
				query.setRange(0, limit);
			}

			execute = (List<Project>) q.execute(Arrays.asList(dbUser.getId()));
			cursor = JDOCursorHelper.getCursor(execute);
			if (cursor != null)
				cursorString = cursor.toWebSafeString();

			// Tight loop for fetching all entities from datastore and accomodate
			// for lazy fetch.
			for (Project obj : execute)
				;
		} finally {
			mgr.close();
		}

		return CollectionResponse.<Project> builder().setItems(execute)
				.setNextPageToken(cursorString).build();
	}

	/**
	 * This method gets the entity having primary key id. It uses HTTP GET method.
	 *
	 * @param id the primary key of the java bean.
	 * @return The entity with primary key id.
	 * @throws UnauthorizedException 
	 */
	@ApiMethod(name = "project.getProject", path="project",  scopes = {Constants.EMAIL_SCOPE},
			clientIds = {Constants.WEB_CLIENT_ID, 
		     com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
		     audiences = {Constants.WEB_CLIENT_ID})
	public AbstractProject getProject(@Named("id") Long id,@Named("type") String type , User user) throws UnauthorizedException {
		PersistenceManager mgr = getPersistenceManager();
		AbstractProject project = null;
		try {
		  switch (type) {
      case "validation":
        project = mgr.getObjectById(ValidationProject.class, id);
        break;

      default:
        project = mgr.getObjectById(Project.class, id);
        Authorization.checkAuthorization((Project)project, user);
        break;
      }
			
			// Check if user is authorized
			
		} finally {
			mgr.close();
		}
		return project;
	}
	
	/**
	 * This method gets the entity having primary key id. It uses HTTP GET method.
	 *
	 * @param id the primary key of the java bean.
	 * @return The entity with primary key id.
	 * @throws UnauthorizedException 
	 */
	@ApiMethod(name = "project.incrCodingId", path="codings",  scopes = {Constants.EMAIL_SCOPE},
			clientIds = {Constants.WEB_CLIENT_ID, 
		     com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
		     audiences = {Constants.WEB_CLIENT_ID})
	public Project getAndIncrCodingId(@Named("id") Long id, User user) throws UnauthorizedException {
		PersistenceManager mgr = getPersistenceManager();
		Project project = null;
		try {
			project = mgr.getObjectById(Project.class, id);
			// Check if user is authorized
			Authorization.checkAuthorization(project, user);
			++project.maxCodingID;
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
	@ApiMethod(name = "project.insertProject",  scopes = {Constants.EMAIL_SCOPE},
			clientIds = {Constants.WEB_CLIENT_ID, 
		     com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
		     audiences = {Constants.WEB_CLIENT_ID})
	public Project insertProject(Project project, User user) throws UnauthorizedException {
		// Check if user is authorized
		//Authorization.checkAuthorization(project, user); // FIXME does not make sense for inserting new projects - only check if user is in DB already
		
		PersistenceManager mgr = getPersistenceManager();
		try {
			if (project.id != null){
				if (containsProject(project)) {
					throw new EntityExistsException("Object already exists");
				}
			}
			project.addOwner(user.getUserId());
			mgr.makePersistent(project);
			// Authorize User
			com.qdacity.server.user.User dbUser = mgr.getObjectById(com.qdacity.server.user.User.class, user.getUserId());
			dbUser.addProjectAuthorization(project.getId());
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
	@ApiMethod(name = "project.updateProject",  scopes = {Constants.EMAIL_SCOPE},
			clientIds = {Constants.WEB_CLIENT_ID, 
		     com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
		     audiences = {Constants.WEB_CLIENT_ID})
	public Project updateProject(Project project, User user) throws UnauthorizedException {
		// Check if user is authorized
		Authorization.checkAuthorization(project, user);
		
		PersistenceManager mgr = getPersistenceManager();
		try {
			if (!containsProject(project)) {
				throw new EntityNotFoundException("Object does not exist");
			}
			mgr.makePersistent(project);
		} finally {
			mgr.close();
		}
		return project;
	}
	
	@ApiMethod(name = "project.addOwner",   scopes = {Constants.EMAIL_SCOPE},
			clientIds = {Constants.WEB_CLIENT_ID, 
		     com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
		     audiences = {Constants.WEB_CLIENT_ID})
	public Project addOwner(@Named("projectID") Long projectID, @Nullable @Named("userID") String userID, User user) throws UnauthorizedException {
		Project project = null;
		PersistenceManager mgr = getPersistenceManager();
		try {
			project = mgr.getObjectById(Project.class, projectID);
			
			if (userID != null) project.addOwner(userID);
			else project.addOwner(user.getUserId());
			
			mgr.makePersistent(project);
		} finally {
			mgr.close();
		}
		return project;
	}
	
	@ApiMethod(name = "project.addCoder",   scopes = {Constants.EMAIL_SCOPE},
      clientIds = {Constants.WEB_CLIENT_ID, 
         com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
         audiences = {Constants.WEB_CLIENT_ID})
  public Project addCoder(@Named("projectID") Long projectID, @Nullable @Named("userID") String userID, User user) throws UnauthorizedException {
    Project project = null;
    PersistenceManager mgr = getPersistenceManager();
    try {
      project = mgr.getObjectById(Project.class, projectID);
      
      if (userID != null)project.addCoder(userID);
      else project.addCoder(user.getUserId());
      
      mgr.makePersistent(project);
    } finally {
      mgr.close();
    }
    return project;
  }
	
	@ApiMethod(name = "project.addValidationCoder",   scopes = {Constants.EMAIL_SCOPE},
      clientIds = {Constants.WEB_CLIENT_ID, 
         com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
         audiences = {Constants.WEB_CLIENT_ID})
  public Project addValidationCoder(@Named("projectID") Long projectID, @Nullable @Named("userID") String userID, User user) throws UnauthorizedException {
    Project project = null;
    PersistenceManager mgr = getPersistenceManager();
    try {
      project = mgr.getObjectById(Project.class, projectID);
      
      if (userID != null) project.addValidationCoder(userID);
      else project.addValidationCoder(user.getUserId());
      
      mgr.makePersistent(project);
    } finally {
      mgr.close();
    }
    return project;
  }
	
	@ApiMethod(name = "project.removeUser",   scopes = {Constants.EMAIL_SCOPE},
      clientIds = {Constants.WEB_CLIENT_ID, 
         com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
         audiences = {Constants.WEB_CLIENT_ID})
  public Project removeValidationCoder(@Named("projectID") Long projectID, @Nullable @Named("userID") String userID, User user) throws UnauthorizedException {
    Project project = null;
    PersistenceManager mgr = getPersistenceManager();
    try {
      project = mgr.getObjectById(Project.class, projectID);
      
      if (userID != null) project.removeUser(userID);
      else project.removeUser(user.getUserId());
      
      mgr.makePersistent(project);
    } finally {
      mgr.close();
    }
    return project;
  }
	
	@ApiMethod(name = "project.inviteUser",   scopes = {Constants.EMAIL_SCOPE},
			clientIds = {Constants.WEB_CLIENT_ID, 
		     com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
		     audiences = {Constants.WEB_CLIENT_ID})
	public Project inviteUser(@Named("projectID") Long projectID, @Named("userEmail") String userEmail, User user) throws UnauthorizedException {
		Project project = null;
		PersistenceManager mgr = getPersistenceManager();
		try {
			
			// Get the invited user
			Query q = mgr.newQuery(com.qdacity.server.user.User.class, "email == '"+userEmail+"'");
			@SuppressWarnings("unchecked")
			List<com.qdacity.server.user.User> dbUsers =   (List<com.qdacity.server.user.User>) q.execute();
			String userID = dbUsers.get(0).getId();
			
			// Get the inviting user
			com.qdacity.server.user.User invitingUser = mgr.getObjectById(com.qdacity.server.user.User.class, user.getUserId());
			
			// Insert user into project as invited user
			project = mgr.getObjectById(Project.class, projectID);
			project.addInvitedUser(user.getUserId());
			
			mgr.makePersistent(project);
			
			
			// Create notification
			UserNotification notification = new UserNotification();
			notification.setDatetime(new Date());
			notification.setMessage("Project: " + project.getName());
			notification.setSubject("Invitation by <b>" + invitingUser.getGivenName() +" "+invitingUser.getSurName() +"</b>");
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
	
	 @ApiMethod(name = "project.createSnapshot",   scopes = {Constants.EMAIL_SCOPE},
	      clientIds = {Constants.WEB_CLIENT_ID, 
	         com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
	         audiences = {Constants.WEB_CLIENT_ID})
	  public Project createSnapshot(@Named("projectID") Long projectID, @Named("comment") String comment, User user) throws UnauthorizedException {
	    Project project = null;
	    PersistenceManager mgr = getPersistenceManager();
	    try {
	      project = mgr.getObjectById(Project.class, projectID);
	      
	      ProjectRevision cloneProject = new ProjectRevision (cloneProject(project, user),project.getId(), comment);
	      
	      project.setRevision(project.getRevision() + 1);
	      
	      cloneProject = mgr.makePersistent(cloneProject);
	      project = mgr.makePersistent(project);
	      
	      TextDocumentEndpoint.cloneTextDocuments(project, cloneProject.getId(), false, user);
	    } finally {
	      mgr.close();
	    }
	    return project;
	  }
	 
	 @ApiMethod(name = "project.requestValidationAccess",   scopes = {Constants.EMAIL_SCOPE},
       clientIds = {Constants.WEB_CLIENT_ID, 
          com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
          audiences = {Constants.WEB_CLIENT_ID})
   public ValidationProject requestValidationAccess(@Named("revisionID") Long revisionID, User user) throws UnauthorizedException {
     ProjectRevision projectRevision = null;
     Project project = null;
     ValidationProject cloneProject = null;
     PersistenceManager mgr = getPersistenceManager();
     try {
       projectRevision = mgr.getObjectById(ProjectRevision.class, revisionID);
       project = mgr.getObjectById(Project.class, projectRevision.getProjectID());
    // Get the inviting user
       com.qdacity.server.user.User requestingUser = mgr.getObjectById(com.qdacity.server.user.User.class, user.getUserId());
       
       // Create notification
       List<String> owners = project.getOwners();
       
       for (String owner : owners) {
         UserNotification notification = new UserNotification();
         notification.setDatetime(new Date());
         notification.setMessage("Project: " + project.getName() + "Rev. " + projectRevision.getRevision());
         notification.setSubject("Validation request by <b>" + requestingUser.getGivenName() +" "+requestingUser.getSurName() +"</b>");
         notification.setOriginUser(user.getUserId());
         notification.setProject(revisionID);
         notification.setSettled(false);
         notification.setType(UserNotificationType.VALIDATION_REQUEST);
         notification.setUser(owner);
         
         mgr.makePersistent(notification);
      }
       
     } finally {
       mgr.close();
     }
     return cloneProject;
   }
	 
	 @ApiMethod(name = "project.createValidationProject",   scopes = {Constants.EMAIL_SCOPE},
       clientIds = {Constants.WEB_CLIENT_ID, 
          com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
          audiences = {Constants.WEB_CLIENT_ID})
   public ValidationProject createValidationProject(@Named("projectID") Long revisionID, @Named("userID") String userID, User user) throws UnauthorizedException {
	   ProjectRevision project = null;
     ValidationProject cloneProject = null;
     PersistenceManager mgr = getPersistenceManager();
     try {
       project = mgr.getObjectById(ProjectRevision.class, revisionID);
       
       cloneProject = createValidationProject(project, user);
       
       cloneProject.addValidationCoder(userID);
       
       //cloneProject.setRevisionID(project.getId());// FIXME Check why this works and previous assignments dont
       
       cloneProject = mgr.makePersistent(cloneProject);
       project = mgr.makePersistent(project);
       
       TextDocumentEndpoint.cloneTextDocuments(project, cloneProject.getId(), true, user);
     } finally {
       mgr.close();
     }
     return cloneProject;
   }
	 
	 @ApiMethod(name = "project.listRevisions",   scopes = {Constants.EMAIL_SCOPE},
       clientIds = {Constants.WEB_CLIENT_ID, 
          com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
          audiences = {Constants.WEB_CLIENT_ID})
   public List<ProjectRevision> listRevisions(@Named("projectID") Long projectID, User user) throws UnauthorizedException {
	   List<ProjectRevision> revisions = null;
     PersistenceManager mgr = getPersistenceManager();
     try {
       
       Query q;
       q = mgr.newQuery(ProjectRevision.class, " projectID  == :projectID");
       
       Map<String, Long> params = new HashMap();
       params.put("projectID", projectID);
       
       List<ProjectRevision> snapshots  = (List<ProjectRevision>)q.executeWithMap(params);

       Query validationQuery = mgr.newQuery(ValidationProject.class, " projectID  == :projectID");
       List<ValidationProject> validationProjects = (List<ValidationProject>)validationQuery.executeWithMap(params);
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
	@ApiMethod(name = "project.removeProject",  scopes = {Constants.EMAIL_SCOPE},
			clientIds = {Constants.WEB_CLIENT_ID, 
		     com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
		     audiences = {Constants.WEB_CLIENT_ID})
  public void removeProject(@Named("id") Long id, User user) throws UnauthorizedException {
    PersistenceManager mgr = getPersistenceManager();
    try {
      Project project = mgr.getObjectById(Project.class, id);
      // Check if user is authorized
      Authorization.checkAuthorization(project, user);
      
      List<String> userIDs = project.getOwners();
      
      for (String projectUserIDs : userIDs) {
        com.qdacity.server.user.User projectUser = mgr.getObjectById(com.qdacity.server.user.User.class, projectUserIDs);
        
        projectUser.removeProjectAuthorization(id);
        mgr.makePersistent(projectUser);
        
      }
      
      Long codeSystemID = project.getCodesystemID();

      mgr.deletePersistent(project);

      // Delete code system
      CodeSystem codeSystem = mgr.getObjectById(CodeSystem.class, codeSystemID);
      
      Query q;
      q = mgr.newQuery(Code.class, " codesytemID  == :codeSystemID");
      //q.deletePersistentAll();
      Map<String, Long> codesParam = new HashMap();
      codesParam.put("codeSystemID", codeSystem.getId());
      @SuppressWarnings("unchecked")
      List<Code> codes =   (List<Code>) q.executeWithMap(codesParam);
      mgr.deletePersistentAll(codes);
      
      mgr.deletePersistent(codeSystem);

      // Delete all documents

      q = mgr.newQuery(TextDocument.class);
      q.setFilter( "projectID == :theID");
      Map<String, Long> paramValues = new HashMap();
      paramValues.put("theID", id);
      mgr.deletePersistentAll((List<TextDocument>)q.executeWithMap(paramValues));

      
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
  @ApiMethod(name = "project.removeProjectRevision",  scopes = {Constants.EMAIL_SCOPE},
      clientIds = {Constants.WEB_CLIENT_ID, 
         com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
         audiences = {Constants.WEB_CLIENT_ID})
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
      q = mgr.newQuery(Code.class, " codesytemID  == :codeSystemID");
      //q.deletePersistentAll();
      Map<String, Long> codesParam = new HashMap();
      codesParam.put("codeSystemID", codeSystem.getId());
      @SuppressWarnings("unchecked")
      List<Code> codes =   (List<Code>) q.executeWithMap(codesParam);
      mgr.deletePersistentAll(codes);
      
      mgr.deletePersistent(codeSystem);

      // Delete all documents

      q = mgr.newQuery(TextDocument.class);
      q.setFilter( "projectID == :theID");
      Map<String, Long> paramValues = new HashMap();
      paramValues.put("theID", id);
      mgr.deletePersistentAll((List<TextDocument>)q.executeWithMap(paramValues));

      
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
 @ApiMethod(name = "project.removeValidationProject",  scopes = {Constants.EMAIL_SCOPE},
     clientIds = {Constants.WEB_CLIENT_ID, 
        com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
        audiences = {Constants.WEB_CLIENT_ID})
 public void removeValidationProject(@Named("id") Long id, User user) throws UnauthorizedException {
   PersistenceManager mgr = getPersistenceManager();
   try {
     ValidationProject project = mgr.getObjectById(ValidationProject.class, id);
     // Check if user is authorized
     Authorization.checkAuthorization(project.getProjectID(), user);
     
     Long codeSystemID = project.getCodesystemID();
     
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
     Map<String, Long> codesParam = new HashMap();
     codesParam.put("revisionID", revisionId);
     
     List<ValidationProject> validationProjects = (List<ValidationProject>)q.executeWithMap(codesParam);
     
     for (ValidationProject validationProject : validationProjects) {
       removeAssociatedData(validationProject);
       mgr.deletePersistent(validationProject);
    }
     
   } finally {
     mgr.close();
   }
 }
 
 private void removeAssociatedData(ValidationProject project)  {
   PersistenceManager mgr = getPersistenceManager();
   try {
     
     // Delete code system
     Long codeSystemID = project.getCodesystemID();
     CodeSystem codeSystem = mgr.getObjectById(CodeSystem.class, codeSystemID);
     
     Query q;
     q = mgr.newQuery(Code.class, " codesytemID  == :codeSystemID");

     Map<String, Long> codesParam = new HashMap();
     codesParam.put("codeSystemID", codeSystem.getId());
     @SuppressWarnings("unchecked")
     List<Code> codes =   (List<Code>) q.executeWithMap(codesParam);
     mgr.deletePersistentAll(codes);
     
     mgr.deletePersistent(codeSystem);

     // Delete all documents

     q = mgr.newQuery(TextDocument.class);
     q.setFilter( "projectID == :theID");
     Map<String, Long> paramValues = new HashMap();
     paramValues.put("theID", project.getId());
     mgr.deletePersistentAll((List<TextDocument>)q.executeWithMap(paramValues));
     
     

     
   } finally {
     mgr.close();
   }
 }
	
	private Project cloneProject(Project project, User user) throws UnauthorizedException{
	  
	  Project cloneProject = new Project(project);
	  CodeSystem codeSystemClone = CodeSystemEndpoint.cloneCodeSystem(project.getCodesystemID(), project.getId(), user);
	  
	  cloneProject.setCodesystemID(codeSystemClone.getId()); 
	  
	  return cloneProject;
	  
	}
	
private ValidationProject createValidationProject(ProjectRevision projectRev, User user) throws UnauthorizedException{
    
    ValidationProject cloneProject = new ValidationProject(projectRev);
    CodeSystem codeSystemClone = CodeSystemEndpoint.cloneCodeSystem(projectRev.getCodesystemID(), projectRev.getId(), user);
    
    cloneProject.setCodesystemID(codeSystemClone.getId());
    
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
