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
  
  

  public DeferredValPrjEvaluation(ValidationProject result, List<Long> docIDs, Long reportID, User user) {
    super();
    this.validationProject = result;
    this.user = user;
    this.docIDs = docIDs;
    this.reportID = reportID;
  }



  @Override
  public void run() {
    
    PersistenceManager mgr = getPersistenceManager();
    
    try {
        TextDocumentEndpoint tde = new TextDocumentEndpoint();
        Collection<TextDocument> originalDocs = tde.getTextDocument(validationProject.getRevisionID(), "REVISION", user).getItems();
 
//        report.setProjectID(validationProject.getProjectID());     
        
        ValidationResult valResult = new ValidationResult(); 
        
        mgr.makePersistent(valResult); // make persistent to generate ID which is passed to deferred persistence of DocumentResults
        
        List<ParagraphAgreement> documentAgreements = new ArrayList<ParagraphAgreement>();
        
        Collection<TextDocument> recodedDocs = tde.getTextDocument(validationProject.getId(), "VALIDATION", user).getItems();

        for (TextDocument original : originalDocs) {
         if (!docIDs.contains(original.getId())) continue; // Exclude text documents that should not be considered
         
         for (TextDocument recoded : recodedDocs) {
           if (original.getTitle().equals(recoded.getTitle())){
             DocumentResult documentAgreement = Agreement.calculateParagraphAgreement(original, recoded);
             documentAgreements.add(documentAgreement.getParagraphAgreement());
    
             //valResult.addDocumentResult(documentAgreement);
             documentAgreement.setValidationResultID(valResult.getId());
             documentAgreement.setOriginDocumentID(original.getId());
          // Persist all DocumentResults asynchronously
             DeferredDocResults deferredDocResults = new DeferredDocResults(documentAgreement,recoded.getId(), user);
             Queue queue = QueueFactory.getDefaultQueue();
             
    //         Future<TaskHandle> future = queue.addAsync(com.google.appengine.api.taskqueue.TaskOptions.Builder.withPayload(deferredDocResults));
             queue.addAsync(com.google.appengine.api.taskqueue.TaskOptions.Builder.withPayload(deferredDocResults));

             //FIXME test if added in new aggregation method correctly
//             DocumentResult documentResultForAggregation = new DocumentResult(documentAgreement);
//             documentResultForAggregation.setDocumentID(original.getId());
//             report.addDocumentResult(documentResultForAggregation);
//             
//             ParagraphAgreement docAgreement = documentResultForAggregation.getParagraphAgreement();
//             
//             if (!(docAgreement.getPrecision() == 1 && docAgreement.getRecall() == 0)){
//    //         documentAverage.add(documentAgreement.getParagraphAgreement());
//             List<ParagraphAgreement> agreementList = agreementByDoc.get(original.getId());
//             if (agreementList == null) agreementList = new ArrayList<ParagraphAgreement>();
//               agreementList.add(docAgreement);
//               agreementByDoc.put(original.getId(), agreementList);
//               //agreementByDoc.putIfAbsent(key, value)
//             }
           }
         }         
       }
        
        ParagraphAgreement totalAgreement = Agreement.calculateAverageAgreement(documentAgreements);
        valResult.setParagraphAgreement(totalAgreement);
        valResult.setName(validationProject.getCreatorName());
        valResult.setRevisionID(validationProject.getRevisionID());
        valResult.setValidationProjectID(validationProject.getId());
        valResult.setReportID(reportID);
        mgr.setMultithreaded(true);
        mgr.makePersistent(valResult);

        
        ValidationEndpoint ve = new ValidationEndpoint();
        List<ValidationResult> validationResults = ve.listValidationResults(reportID, user);
        Logger.getLogger("logger").log(Level.WARNING, " So many results " + validationResults.size() + " for report " + reportID + " at time "  + System.currentTimeMillis());
    
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
