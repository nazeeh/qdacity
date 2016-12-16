package com.qdacity.project.metrics.tasks;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

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
import com.qdacity.project.metrics.DocumentResult;

public class DeferredDocResults implements DeferredTask {
  
  DocumentResult result;
  Long recodedDocID;
//  Long validationProjectID;
  User user;

  public DeferredDocResults(DocumentResult result, Long recodedDocID , User user) {
    super();
    this.result = result;
    this.user = user;
    this.recodedDocID = recodedDocID;
//    this.validationProjectID = validationProjectID;
  }



  @Override
  public void run() {
    PersistenceManager mgr = getPersistenceManager();
    Transaction tx = mgr.currentTransaction();
    
    try {
        TextDocumentEndpoint tde = new TextDocumentEndpoint();

//          Collection<TextDocument> originalDocs = tde.getTextDocument(revisionID, "REVISION", user).getItems();
//          Collection<TextDocument> recodedDocs = tde.getTextDocument(recodedDocID, "VALIDATION", user).getItems();
        TextDocument recodedDoc = mgr.getObjectById(TextDocument.class, recodedDocID);
        
//          List<DocumentResult> results = new ArrayList<DocumentResult>();
//          results.add(result);
//          
        result.generateAgreementMap(recodedDoc);
        tx.begin();
//          Agreement.generateAgreementMaps(results, recodedDocs);
        
        
        
        
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
