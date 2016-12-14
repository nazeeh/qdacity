package com.qdacity.project.metrics.tasks;

import java.util.Collection;
import java.util.List;

import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import javax.jdo.Transaction;

import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.taskqueue.DeferredTask;
import com.google.appengine.api.users.User;
import com.qdacity.PMF;
import com.qdacity.project.data.TextDocument;
import com.qdacity.project.data.TextDocumentEndpoint;
import com.qdacity.project.metrics.Agreement;
import com.qdacity.project.metrics.ValidationResult;

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
      
      
//      List<DocumentResult> docResults = result.getDocumentResults();
//      for (DocumentResult documentResult : docResults) {
//        documentResult.setDocumentName("CHANGED");
//        documentResult.setKey(null);
//      }
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
