package com.qdacity.user;

import com.qdacity.Authorization;
import com.qdacity.Constants;
import com.qdacity.PMF;
import com.qdacity.logs.Change;
import com.qdacity.logs.ChangeObject;
import com.qdacity.logs.ChangeType;
import com.qdacity.project.ValidationProject;
import com.qdacity.project.codesystem.CodeSystem;
import com.qdacity.taskboard.Task;
import com.qdacity.taskboard.TaskBoard;
import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiMethod.HttpMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.response.CollectionResponse;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.datastore.Cursor;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query.CompositeFilter;
import com.google.appengine.api.datastore.Query.CompositeFilterOperator;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.api.log.LogService.LogLevel;
import com.google.appengine.datanucleus.query.JDOCursorHelper;
import com.google.common.collect.Lists;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.annotation.Nullable;
import javax.inject.Named;
import javax.persistence.EntityExistsException;
import javax.persistence.EntityNotFoundException;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;

@Api(name = "qdacity", version = "v4", namespace = @ApiNamespace(ownerDomain = "qdacity.com", ownerName = "qdacity.com", packagePath = "server.project"))
public class UserEndpoint {

	/**
	 * This method lists all the entities inserted in datastore.
	 * It uses HTTP GET method and paging support.
	 *
	 * @return A CollectionResponse class containing the list of all entities
	 * persisted and a cursor to the next page.
	 * @throws UnauthorizedException 
	 */
	@SuppressWarnings({ "unchecked", "unused" })
	@ApiMethod(name = "user.listUser", path = "userlist",  scopes = {Constants.EMAIL_SCOPE},
			clientIds = {Constants.WEB_CLIENT_ID, 
		     com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
		     audiences = {Constants.WEB_CLIENT_ID})
	public List<User> listUser(
			@Nullable @Named("cursor") String cursorString,
			@Nullable @Named("limit") Integer limit, @Named("projectID") Long projectID, com.google.appengine.api.users.User user) throws UnauthorizedException {
		
				//Authorization.checkAuthorization(projectID, user); //FIXME consider public projects
				
				//Set filter
				List<Long> idsToFilter = new ArrayList<Long>();
				idsToFilter.add(projectID);
				Filter filter = new FilterPredicate("projects", FilterOperator.IN, idsToFilter);
		

				DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

				com.google.appengine.api.datastore.Query q = new com.google.appengine.api.datastore.Query("User").setFilter(filter);

				PreparedQuery pq = datastore.prepare(q);
				
				Calendar cal = Calendar.getInstance();
				
				Map<String, Integer> freq = new HashMap<String, Integer>();

//				List<User> users = (List<User>)(List<?>)Lists.newArrayList(  pq.asIterable() );
				
				List<User> users = new ArrayList<User>();
				
				for (Entity result : pq.asIterable()) {
					User dbUser = new User();
					dbUser.setGivenName((String) result.getProperty("givenName"));
					dbUser.setSurName((String) result.getProperty("surName"));
					dbUser.setProjects((List<Long>) result.getProperty("projects"));
					dbUser.setId((String) result.getProperty("id"));
					dbUser.setType(UserType.valueOf((String)result.getProperty("type")));
					
					users.add(dbUser);
				}
				
				return users;
	}
	
	 @SuppressWarnings({ "unchecked", "unused" })
	  @ApiMethod(name = "user.findUsers", path = "userlist",  scopes = {Constants.EMAIL_SCOPE},
	      clientIds = {Constants.WEB_CLIENT_ID, 
	         com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
	         audiences = {Constants.WEB_CLIENT_ID})
	  public List<User> findUsers(
	      @Nullable @Named("cursor") String cursorString,
	      @Nullable @Named("limit") Integer limit, @Named("searchTerm") String searchTerm, com.google.appengine.api.users.User user) throws UnauthorizedException {
	    
	        //Authorization.checkAuthorization(projectID, user); //FIXME only ADMIN
	        
	   
	        List<Filter> filterList = new ArrayList<Filter>();
	        //Set filter
	        filterList.add(new FilterPredicate("givenName", FilterOperator.EQUAL, searchTerm));
	        filterList.add(new FilterPredicate("surName", FilterOperator.EQUAL, searchTerm));
	        filterList.add(new FilterPredicate("email", FilterOperator.EQUAL, searchTerm));
//	        
//	        Filter filterGivenName = new FilterPredicate("givenName", FilterOperator.EQUAL, searchTerm);
//	        Filter filterSurName = new FilterPredicate("surName", FilterOperator.EQUAL, searchTerm);
//	        Filter filterEmail = new FilterPredicate("email", FilterOperator.EQUAL, searchTerm);
//	        
	        
	        
	        CompositeFilter compFilter = new CompositeFilter(CompositeFilterOperator.OR, filterList);
	        
	        DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();


	        com.google.appengine.api.datastore.Query q = new com.google.appengine.api.datastore.Query("User").setFilter(compFilter);

	        PreparedQuery pq = datastore.prepare(q);
	        
	        Calendar cal = Calendar.getInstance();
	        
	        Map<String, Integer> freq = new HashMap<String, Integer>();

//	        List<User> users = (List<User>)(List<?>)Lists.newArrayList(  pq.asIterable() );
	        
	        List<User> users = new ArrayList<User>();
	        
	        for (Entity result : pq.asIterable()) {
	          User dbUser = new User();
	          
	          Logger.getLogger("logger").log(Level.INFO,   "Found User: " + result.getKey().getName());
	          dbUser.setId(result.getKey().getName());
	          dbUser.setGivenName((String) result.getProperty("givenName"));
	          dbUser.setSurName((String) result.getProperty("surName"));
	          dbUser.setProjects((List<Long>) result.getProperty("projects"));
	          dbUser.setType(UserType.valueOf((String)result.getProperty("type")));
	          dbUser.setEmail((String) result.getProperty("email"));
	          
	          users.add(dbUser);
	        }
	        
	        return users;
	  }
	
	 @ApiMethod(name = "user.listValidationCoders", path = "validationProject",  scopes = {Constants.EMAIL_SCOPE},
	      clientIds = {Constants.WEB_CLIENT_ID, 
	         com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
	         audiences = {Constants.WEB_CLIENT_ID})
	public List<User> listValidationCoders(@Named("validationProject") Long projectID, com.google.appengine.api.users.User user) {
	  List<User> users = new ArrayList<User>();
	  PersistenceManager mgr = getPersistenceManager();
	  try {
      ValidationProject project = mgr.getObjectById(ValidationProject.class, projectID);
      List<String> validationCoders = project.getValidationCoders();
      if (!validationCoders.isEmpty()){
        Query userQuery = mgr.newQuery(User.class, ":p.contains(id)");

        users = (List<User>) userQuery.execute(validationCoders);
      }
    } finally {
      mgr.close();
    }
	  
	  return users;
	}

	/**
	 * This method gets the entity having primary key id. It uses HTTP GET method.
	 *
	 * @param id the primary key of the java bean.
	 * @return The entity with primary key id.
	 * @throws UnauthorizedException 
	 */
	@ApiMethod(name = "getUser",  scopes = {Constants.EMAIL_SCOPE},
			clientIds = {Constants.WEB_CLIENT_ID, 
		     com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
		     audiences = {Constants.WEB_CLIENT_ID})
	public User getUser(@Named("id") String id, com.google.appengine.api.users.User loggedInUser) throws UnauthorizedException {
		PersistenceManager mgr = getPersistenceManager();
		User user = null;
		try {
			user = mgr.getObjectById(User.class, id);
			
			//Check if user is authorized
			Authorization.checkAuthorization(user, loggedInUser);
			
		} finally {
			mgr.close();
		}
		return user;
	}
	
	 @ApiMethod(name = "updateUserType",  scopes = {Constants.EMAIL_SCOPE},
	      clientIds = {Constants.WEB_CLIENT_ID, 
	         com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
	         audiences = {Constants.WEB_CLIENT_ID})
	  public User updateUserType(@Named("id") String id, @Named("type") String type, com.google.appengine.api.users.User loggedInUser) throws UnauthorizedException {
	    PersistenceManager mgr = getPersistenceManager();
	    User user = null;
	    try {
	      user = mgr.getObjectById(User.class, id);
	      
	      //FIXME Check if user is authorized
	      //Authorization.checkAuthorization(user, loggedInUser);
	      
        switch (type) {
        case "ADMIN":
          user.setType(UserType.ADMIN);
          break;
        case "USER":
          user.setType(UserType.USER);
          break;
        default:
          break;
        }
	      
	    } finally {
	      mgr.close();
	    }
	    return user;
	  }
	
	 @ApiMethod(name = "user.getCurrentUser",  scopes = {Constants.EMAIL_SCOPE},
	      clientIds = {Constants.WEB_CLIENT_ID, 
	         com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
	         audiences = {Constants.WEB_CLIENT_ID})
	  public User getCurrentUser(com.google.appengine.api.users.User loggedInUser) throws UnauthorizedException {
	    PersistenceManager mgr = getPersistenceManager();
	    User user = null;
	    try {
	      user = mgr.getObjectById(User.class, loggedInUser.getUserId());

	    } finally {
	      mgr.close();
	    }
	    return user;
	  }
	
	@ApiMethod(name = "user.getTaskboard", path="usertaskboard",  scopes = {Constants.EMAIL_SCOPE},
			clientIds = {Constants.WEB_CLIENT_ID, 
		     com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
		     audiences = {Constants.WEB_CLIENT_ID})
	public TaskBoard getTaskboard(com.google.appengine.api.users.User loggedInUser) throws UnauthorizedException {
		PersistenceManager mgr = getPersistenceManager();
		User user = null;
		List<TaskBoard> boards = new ArrayList<TaskBoard>();;
		TaskBoard board = null;
		try {
			user = mgr.getObjectById(User.class, loggedInUser.getUserId());
			Query query = mgr.newQuery(TaskBoard.class);
			query.setFilter("id == "+user.getTaskBoardId());
			
			boards = (List<TaskBoard>) query.execute();
			board = boards.get(0);
			
			List<Task> taskList = board.getTodo();
			if (board.getTodo() != null){
				for (Task task : taskList) {
					task.getText();
				}
			}
			taskList = board.getInProgress();
			if (taskList != null){
				for (Task task : taskList) {
					task.getText();
				}
			}
			
			taskList = board.getDone();
			if (taskList != null){
				for (Task task : taskList) {
					task.getText();
				}
			}
//			Logger.getGlobal().log(LogLevel.INFO,"user has board  " +  user.getTaskBoardId());
//			board = mgr.getObjectById(TaskBoard.class, user.getTaskBoardId());
			//Check if user is authorized
			//Authorization.checkAuthorization(user, loggedInUser);
			
		} finally {
			mgr.close();
		}
		return board;
	}

	/**
	 * This inserts a new entity into App Engine datastore. If the entity already
	 * exists in the datastore, an exception is thrown.
	 * It uses HTTP POST method.
	 *
	 * @param user the entity to be inserted.
	 * @return The inserted entity.
	 */
	@ApiMethod(name = "insertUser",  scopes = {Constants.EMAIL_SCOPE},
			clientIds = {Constants.WEB_CLIENT_ID, 
		     com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
		     audiences = {Constants.WEB_CLIENT_ID})
	public User insertUser(User user, com.google.appengine.api.users.User loggedInUser) {
	  user.setId(loggedInUser.getUserId());
	  user.setProjects(new ArrayList<Long>());
	  user.setType(UserType.USER);
		PersistenceManager mgr = getPersistenceManager();
		try {
			if (user.id != null && containsUser(user)) {
				throw new EntityExistsException("Object already exists");
			}
			mgr.makePersistent(user);
		} finally {
			mgr.close();
		}
		return user;
	}

	/**
	 * This method is used for updating an existing entity. If the entity does not
	 * exist in the datastore, an exception is thrown.
	 * It uses HTTP PUT method.
	 *
	 * @param user the entity to be updated.
	 * @return The updated entity.
	 * @throws UnauthorizedException 
	 */
	//FIXME Possibly remove, or make secure.
	@ApiMethod(name = "updateUser",  scopes = {Constants.EMAIL_SCOPE},
			clientIds = {Constants.WEB_CLIENT_ID, 
		     com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
		     audiences = {Constants.WEB_CLIENT_ID})
	public User updateUser(User user, com.google.appengine.api.users.User loggedInUser) throws UnauthorizedException {
		//Check if user is authorized
		Authorization.checkAuthorization(user, loggedInUser);
		
		PersistenceManager mgr = getPersistenceManager();
		try {
			if (!containsUser(user)) {
				throw new EntityNotFoundException("Object does not exist");
			}
			mgr.makePersistent(user);
		} finally {
			mgr.close();
		}
		return user;
	}

	/**
	 * This method removes the entity with primary key id.
	 * It uses HTTP DELETE method.
	 *
	 * @param id the primary key of the entity to be deleted.
	 * @throws UnauthorizedException 
	 */
	@ApiMethod(name = "removeUser",  scopes = {Constants.EMAIL_SCOPE},
			clientIds = {Constants.WEB_CLIENT_ID, 
		     com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
		     audiences = {Constants.WEB_CLIENT_ID})
	public void removeUser(@Named("id") String id, com.google.appengine.api.users.User loggedInUser) throws UnauthorizedException {
		PersistenceManager mgr = getPersistenceManager();
		try {
			User user = mgr.getObjectById(User.class, id);
			
			//Check if user is authorized
			Authorization.checkAuthorization(user, loggedInUser);
			
			mgr.deletePersistent(user);
		} finally {
			mgr.close();
		}
	}

	private boolean containsUser(User user) {
		PersistenceManager mgr = getPersistenceManager();
		boolean contains = true;
		try {
			mgr.getObjectById(User.class, user.getId());
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
