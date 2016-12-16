package com.qdacity.maintenance;

import com.qdacity.Authorization;
import com.qdacity.Constants;
import com.qdacity.PMF;
import com.qdacity.logs.Change;
import com.qdacity.logs.ChangeObject;
import com.qdacity.logs.ChangeType;
import com.qdacity.maintenance.tasks.OrphanDeletion;
import com.qdacity.maintenance.tasks.ValidationCleanup;
import com.qdacity.project.ValidationProject;
import com.qdacity.project.codesystem.CodeSystem;
import com.qdacity.project.metrics.tasks.DeferredEvaluation;
import com.qdacity.taskboard.Task;
import com.qdacity.taskboard.TaskBoard;
import com.qdacity.user.User;
import com.qdacity.user.UserType;
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
import com.google.appengine.api.taskqueue.Queue;
import com.google.appengine.api.taskqueue.QueueFactory;
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
public class MaintenanceEndpoint {
  
  @ApiMethod(name = "maintenance.cleanupValidationResults",  scopes = {Constants.EMAIL_SCOPE},
      clientIds = {Constants.WEB_CLIENT_ID, 
         com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
         audiences = {Constants.WEB_CLIENT_ID})
  public void cleanupValidationResults( com.google.appengine.api.users.User user) throws UnauthorizedException {
   
   cleanUpValidationResults();
   
   cleanUpOrphans();
   
  }

  private void cleanUpValidationResults() {
    ValidationCleanup task = new ValidationCleanup();
     Queue queue = QueueFactory.getDefaultQueue();
     queue.addAsync(com.google.appengine.api.taskqueue.TaskOptions.Builder.withPayload(task));
  }
  
  private void cleanUpOrphans() {
    OrphanDeletion task = new OrphanDeletion();
    Queue queue = QueueFactory.getDefaultQueue();
    queue.addAsync(com.google.appengine.api.taskqueue.TaskOptions.Builder.withPayload(task));
  }

	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}

}
