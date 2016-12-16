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
import javax.jdo.Transaction;

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

public class DocResultDeletion  implements DeferredTask {

Long resultID;
  
  public DocResultDeletion(Long resultID) {
    super();
    this.resultID = resultID;
  }



  @Override
  public void run() {
    PersistenceManager mgr = getPersistenceManager();
//    Transaction tx = mgr.currentTransaction();
    try {
      
//      tx.begin();
      Query docResultQuery = mgr.newQuery(DocumentResult.class);
      docResultQuery.setFilter("validationResultID == " +resultID);
      List<DocumentResult> docResults = (List<DocumentResult>)docResultQuery.execute();
      Logger.getLogger("logger").log(Level.INFO,  "Deleting " + docResults.size() + " DocumentResult." );
      mgr.deletePersistentAll(docResults);
      
      
      
//      tx.commit();
    } finally {
//      if (tx.isActive())
//      {
//          Logger.getLogger("logger").log(Level.WARNING,   "Could not delete results for report : " + this.reportID );
//          tx.rollback(); // Error occurred so rollback the PM transaction
//      }
      mgr.close();
    }
    
  }
  
  private static PersistenceManager getPersistenceManager() {
    return PMF.get().getPersistenceManager();
  }

}
