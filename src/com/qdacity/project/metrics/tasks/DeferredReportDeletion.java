package com.qdacity.project.metrics.tasks;

import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import javax.jdo.Transaction;

import com.google.appengine.api.taskqueue.DeferredTask;
import com.qdacity.PMF;
import com.qdacity.project.metrics.DocumentResult;
import com.qdacity.project.metrics.ValidationResult;

public class DeferredReportDeletion implements DeferredTask {
  
  Long reportID;
  
  public DeferredReportDeletion(Long reportID) {
    super();
    this.reportID = reportID;
  }



  @Override
  public void run() {
    PersistenceManager mgr = getPersistenceManager();
//    Transaction tx = mgr.currentTransaction();
    try {
      
//      tx.begin();

   // Delete all ValidationResults / new - foreign key in result
      Query q2 = mgr.newQuery(ValidationResult.class, "reportID  == :reportID");
//      Map<String, Long> params = new HashMap();
//      params.put("reportID", repID);
      List<ValidationResult> results = (List<ValidationResult>) q2.execute(this.reportID);
      
      //Delete all DocumentResults corresponding to the ValidationResults
      for (ValidationResult validationResult : results) {
        validationResult.getParagraphAgreement().getfMeasure(); //Lazy Fetch
        Query q3 = mgr.newQuery(DocumentResult.class, "validationResultID  == :validationResultID");
        List<DocumentResult> docResults = (List<DocumentResult>) q3.execute(validationResult.getId());
        if (docResults != null){
//          for (DocumentResult documentResult : docResults) {
//            mgr.deletePersistent(documentResult);
//          }
        
        
        if (docResults != null && !docResults.isEmpty()) {
          for (DocumentResult documentResult : docResults) {
            documentResult.getParagraphAgreement().getfMeasure();
            documentResult.getAgreementMap();
          }
          mgr.deletePersistentAll(docResults);
        }
        }
      }
      
      mgr.deletePersistentAll(results);
      
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
