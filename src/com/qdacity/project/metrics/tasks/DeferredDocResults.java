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
  Long valPrjID;
//  Long validationProjectID;
  User user;

  public DeferredDocResults(DocumentResult result, Long valPrjID, User user) {
    super();
    this.result = result;
    this.user = user;
    this.valPrjID = valPrjID;
//    this.validationProjectID = validationProjectID;
  }



  @Override
  public void run() {
    PersistenceManager mgr = getPersistenceManager();
    Transaction tx = mgr.currentTransaction();
    
    try {
        TextDocumentEndpoint tde = new TextDocumentEndpoint();
        try {
//          Collection<TextDocument> originalDocs = tde.getTextDocument(revisionID, "REVISION", user).getItems();
          Collection<TextDocument> recodedDocs = tde.getTextDocument(valPrjID, "VALIDATION", user).getItems();
          List<DocumentResult> results = new ArrayList<DocumentResult>();
          results.add(result);
          tx.begin();
          Agreement.generateAgreementMaps(results, recodedDocs);
          
          
          Logger.getLogger("logger").log(Level.INFO,   "Persisting DocResult for ValidationResult : " + result.getValidationResultID() + " DocResults");
          mgr.makePersistent(result);
          tx.commit();
        } catch (UnauthorizedException e) {
          // TODO Auto-generated catch block
          e.printStackTrace();
        }
      
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
