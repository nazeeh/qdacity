package com.qdacity.maintenance.tasks;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.inject.Named;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;

import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.taskqueue.DeferredTask;
import com.google.appengine.api.taskqueue.Queue;
import com.google.appengine.api.taskqueue.QueueFactory;
import com.google.appengine.api.taskqueue.TaskHandle;
import com.google.appengine.api.users.User;
import com.qdacity.PMF;
import com.qdacity.project.ValidationProject;
import com.qdacity.project.data.TextDocument;
import com.qdacity.project.data.TextDocumentEndpoint;
import com.qdacity.project.metrics.Agreement;
import com.qdacity.project.metrics.DocumentResult;
import com.qdacity.project.metrics.ParagraphAgreement;
import com.qdacity.project.metrics.ValidationEndpoint;
import com.qdacity.project.metrics.ValidationReport;
import com.qdacity.project.metrics.ValidationResult;
import com.qdacity.taskboard.TaskBoard;
import com.qdacity.user.UserType;

public class ValidationCleanup  implements DeferredTask {


  public ValidationCleanup() {
    super();
  }

  @Override
  public void run() {
    Logger.getLogger("logger").log(Level.INFO,   "Cleaning up");
    
    PersistenceManager mgr = getPersistenceManager();
    try {
      
      Query query = mgr.newQuery(ValidationResult.class);
      query.setFilter("reportID == null");
      
      List<ValidationResult> results = (List<ValidationResult>)query.execute();      
      
      for (ValidationResult result : results) {
        result.getId();
      }
      
      for (ValidationResult result : results) {
        DocResultDeletion task = new DocResultDeletion(result.getId());
        Queue queue = QueueFactory.getDefaultQueue();
        queue.addAsync(com.google.appengine.api.taskqueue.TaskOptions.Builder.withPayload(task));
      }
      
      Logger.getLogger("logger").log(Level.INFO, "Deleting " +  results.size() + " ValidationResult. ");
      
      mgr.deletePersistentAll(results);

      
    } finally {
      mgr.close();
    }
    
  }

  
  private static PersistenceManager getPersistenceManager() {
    return PMF.get().getPersistenceManager();
  }

}
