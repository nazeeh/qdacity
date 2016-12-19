package com.qdacity.project.metrics.tasks;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import javax.jdo.Transaction;

import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.memcache.Expiration;
import com.google.appengine.api.memcache.MemcacheService;
import com.google.appengine.api.memcache.MemcacheServiceFactory;
import com.google.appengine.api.taskqueue.DeferredTask;
import com.google.appengine.api.taskqueue.Queue;
import com.google.appengine.api.taskqueue.QueueFactory;
import com.google.appengine.api.users.User;
import com.qdacity.PMF;
import com.qdacity.project.ValidationProject;
import com.qdacity.project.data.TextDocument;
import com.qdacity.project.data.TextDocumentEndpoint;
import com.qdacity.project.metrics.Agreement;
import com.qdacity.project.metrics.DocumentResult;
import com.qdacity.project.metrics.ParagraphAgreement;
import com.qdacity.project.metrics.ValidationEndpoint;
import com.qdacity.project.metrics.ValidationResult;

public class DeferredValPrjEvaluation implements DeferredTask {
  
  ValidationProject validationProject;
  User user;
  List<Long> docIDs;
  Long reportID;
  List<Long> orignalDocIDs;
  
  

  public DeferredValPrjEvaluation(ValidationProject result, List<Long> docIDs, List<Long> orignalDocIDs, Long reportID, User user) {
    super();
    this.validationProject = result;
    this.user = user;
    this.docIDs = docIDs; // FIXME dont need anymore, because only list of relevant textdocumentIDs is passed?
    this.orignalDocIDs = orignalDocIDs;
    this.reportID = reportID;
  }



  @Override
  public void run() {
    
    PersistenceManager mgr = getPersistenceManager();
    
    try {
        TextDocumentEndpoint tde = new TextDocumentEndpoint();
        
        Collection<TextDocument> originalDocs = new ArrayList<TextDocument>();
        
        for (Long docID : orignalDocIDs) {
          String keyString = KeyFactory.createKeyString(TextDocument.class.toString(), docID);
          MemcacheService syncCache = MemcacheServiceFactory.getMemcacheService();
          syncCache.get(keyString);
          TextDocument origialDoc = (TextDocument) syncCache.get(keyString);
          if (origialDoc == null){
            origialDoc = mgr.getObjectById(TextDocument.class, docID);
          }
          originalDocs.add(origialDoc);
        }
        
//        report.setProjectID(validationProject.getProjectID());     
        
        ValidationResult valResult = new ValidationResult(); 
        
        mgr.makePersistent(valResult); // make persistent to generate ID which is passed to deferred persistence of DocumentResults
        
        List<ParagraphAgreement> documentAgreements = new ArrayList<ParagraphAgreement>();
        
        Collection<TextDocument> recodedDocs = tde.getTextDocument(validationProject.getId(), "VALIDATION", user).getItems();

        for (TextDocument textDocument : recodedDocs) { 
          String keyString = KeyFactory.createKeyString(TextDocument.class.toString(), textDocument.getId());
          MemcacheService syncCache = MemcacheServiceFactory.getMemcacheService();
          syncCache.put(keyString, textDocument,Expiration.byDeltaSeconds(300));
          
        }
        
        for (TextDocument original : originalDocs) {// FIXME reverse order of the two loops to put the memcache operation here instead of preceding in its own loop 
//         if (!docIDs.contains(original.getId())) continue; // Exclude text documents that should not be considered
         
         for (TextDocument recoded : recodedDocs) {
           if (original.getTitle().equals(recoded.getTitle())){
             DocumentResult documentAgreement = Agreement.calculateParagraphAgreement(original, recoded);
             documentAgreements.add(documentAgreement.getParagraphAgreement());
    
             //valResult.addDocumentResult(documentAgreement);
             documentAgreement.setValidationResultID(valResult.getId());
             documentAgreement.setOriginDocumentID(original.getId());
             
             // Persist all DocumentResults asynchronously
             DeferredDocResults deferredDocResults = new DeferredDocResults(documentAgreement,recoded.getId(), user);
             Queue queue = QueueFactory.getQueue("DocumentResultQueue");
             
             queue.addAsync(com.google.appengine.api.taskqueue.TaskOptions.Builder.withPayload(deferredDocResults));

           }
         }         
       }
        
        ParagraphAgreement totalAgreement = Agreement.calculateAverageAgreement(documentAgreements);
        valResult.setParagraphAgreement(totalAgreement);
        valResult.setName(validationProject.getCreatorName());
        valResult.setRevisionID(validationProject.getRevisionID());
        valResult.setValidationProjectID(validationProject.getId());
        valResult.setReportID(reportID);
        mgr.setMultithreaded(true); // FIXME needed?
        mgr.makePersistent(valResult);

        
//        ValidationEndpoint ve = new ValidationEndpoint();
//        List<ValidationResult> validationResults = ve.listValidationResults(reportID, user);
//        Logger.getLogger("logger").log(Level.WARNING, " So many results " + validationResults.size() + " for report " + reportID + " at time "  + System.currentTimeMillis());
    
  } catch (UnauthorizedException e) {
    // TODO Auto-generated catch block
    e.printStackTrace();
  } finally {
    mgr.close();
  }
    
    
  }

  private static PersistenceManager getPersistenceManager() {
    return PMF.get().getPersistenceManager();
  }
}
