package com.qdacity.project.metrics.tasks;

import java.security.Policy;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import javax.jdo.Transaction;

import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.memcache.Expiration;
import com.google.appengine.api.memcache.MemcacheService;
import com.google.appengine.api.memcache.MemcacheServiceFactory;
import com.google.appengine.api.taskqueue.DeferredTask;
import com.google.appengine.api.users.User;
import com.qdacity.PMF;
import com.qdacity.project.data.TextDocument;
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
        TextDocument recodedDoc;
        MemcacheService syncCache = MemcacheServiceFactory.getMemcacheService();
        String keyString = KeyFactory.createKeyString(TextDocument.class.toString(), recodedDocID);
        recodedDoc = (TextDocument) syncCache.get(keyString);

        
        if (recodedDoc == null){
          recodedDoc = mgr.getObjectById(TextDocument.class, recodedDocID);
        }
        
        result.generateAgreementMap(recodedDoc);
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
