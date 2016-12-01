package com.qdacity.project.metrics;

import java.util.List;

import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import javax.jdo.Transaction;

import com.google.appengine.api.taskqueue.DeferredTask;
import com.qdacity.PMF;

public class DeferredResults implements DeferredTask {
  
  ValidationResult result;
  
  

  public DeferredResults(ValidationResult result) {
    super();
    this.result = result;
  }



  @Override
  public void run() {
    PersistenceManager mgr = getPersistenceManager();
    Transaction tx = mgr.currentTransaction();
    try {
      
      tx.begin();
      List<DocumentResult> docResults = result.getDocumentResults();
      for (DocumentResult documentResult : docResults) {
        documentResult.setDocumentName("CHANGED");
        documentResult.setKey(null);
      }
      //mgr.makeTransactional(result);
      
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
