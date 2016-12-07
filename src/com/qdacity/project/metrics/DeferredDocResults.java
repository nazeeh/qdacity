package com.qdacity.project.metrics;

import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import javax.jdo.Transaction;

import com.google.appengine.api.taskqueue.DeferredTask;
import com.qdacity.PMF;

public class DeferredDocResults implements DeferredTask {
  
  DocumentResult result;

  public DeferredDocResults(DocumentResult result) {
    super();
    this.result = result;
  }



  @Override
  public void run() {
    PersistenceManager mgr = getPersistenceManager();
    Transaction tx = mgr.currentTransaction();
    try {
      
      tx.begin();
      Logger.getLogger("logger").log(Level.INFO,   "Persisting DocResult for ValidationResult : " + result.getValidationResultID() + " DocResults");
      mgr.makePersistent(result);
      tx.commit();
    } finally {
      if (tx.isActive())
      {
          tx.rollback(); // Error occurred so rollback the PM transaction
      }
      mgr.close();
    }
    
  }

  private static PersistenceManager getPersistenceManager() {
    return PMF.get().getPersistenceManager();
  }
}
