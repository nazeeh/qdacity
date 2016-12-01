package com.qdacity.project.metrics;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.inject.Named;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;

import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.taskqueue.DeferredTask;
import com.google.appengine.api.taskqueue.Queue;
import com.google.appengine.api.taskqueue.QueueFactory;
import com.google.appengine.api.users.User;
import com.qdacity.PMF;
import com.qdacity.project.ValidationProject;
import com.qdacity.project.data.TextDocument;
import com.qdacity.project.data.TextDocumentEndpoint;
import com.qdacity.user.UserType;

public class DeferredEvaluation  implements DeferredTask {
  Long revisionID;
  String name;
  String docIDsString;
  User user;
  
  
  

  public DeferredEvaluation(Long revisionID, String name, String docIDsString, User user) {
    super();
    this.revisionID = revisionID;
    this.name = name;
    this.docIDsString = docIDsString;
    this.user = user;
  }

  @Override
  public void run() {
    long startTime = System.nanoTime();
    
    List<String> docIDArray = Arrays.asList(docIDsString.split("\\s*,\\s*"));
    List<Long> docIDs = new ArrayList<Long>();
    for (String string : docIDArray) {
      docIDs.add(Long.parseLong(string));
    }
    
    List<ValidationProject> validationProjects = null;
    PersistenceManager mgr = getPersistenceManager();
    try {
      TextDocumentEndpoint tde = new TextDocumentEndpoint();
      Query q;
      q = mgr.newQuery(ValidationProject.class, "revisionID  == :revisionID");
      
      Map<String, Long> params = new HashMap();
      params.put("revisionID", revisionID);

      Collection<TextDocument> originalDocs = tde.getTextDocument(revisionID, "REVISION", user).getItems();

      validationProjects = (List<ValidationProject>)q.executeWithMap(params);
      
      List<ParagraphAgreement> validationCoderAvg = new ArrayList<ParagraphAgreement>(); 
      ValidationReport report = new ValidationReport();
      report.setRevisionID(revisionID);
      report.setName(name);
      report.setDatetime(new Date());
      
      List<ValidationResult> results = new ArrayList<ValidationResult>();
      
      for (ValidationProject validationProject : validationProjects) {
        report.setProjectID(validationProject.getProjectID());     
        
        ValidationResult valResult = new ValidationResult(); 

        List<ParagraphAgreement> documentAgreements = new ArrayList<ParagraphAgreement>();
        Collection<TextDocument> recodedDocs = tde.getTextDocument(validationProject.getId(), "VALIDATION", user).getItems();
//        Logger.getLogger("logger").log(Level.INFO,   "Number of original docs: " + originalDocs.size() + " Number of recoded docs: "+ recodedDocs.size());
//        Logger.getLogger("logger").log(Level.INFO,   "Docs to evaluate: " + docIDs.toArray().toString());
        for (TextDocument original : originalDocs) {
         if (!docIDs.contains(original.getId())) continue; // Exclude text documents that should not be considered
         for (TextDocument recoded : recodedDocs) {
           if (original.getTitle().equals(recoded.getTitle())){
             DocumentResult documentAgreement = Agreement.calculateParagraphAgreement(original, recoded);
             documentAgreements.add(documentAgreement.getParagraphAgreement());

             valResult.addDocumentResult(documentAgreement);
             DocumentResult documentResultForAggregation = new DocumentResult(documentAgreement);
             documentResultForAggregation.setDocumentID(original.getId());
             report.addDocumentResult(documentResultForAggregation);
           }
         }
       }
        
        ParagraphAgreement totalAgreement = Agreement.calculateAverageAgreement(documentAgreements);
        if (!(totalAgreement.getPrecision() == 1 && totalAgreement.getRecall() == 0)) validationCoderAvg.add(totalAgreement); // We exclude validationproject where nothing was coded (recall 0 prec 1) from calculation of avg
        
        valResult.setParagraphAgreement(totalAgreement);
        valResult.setName(validationProject.getCreatorName());
        valResult.setRevisionID(revisionID);
        valResult.setValidationProjectID(validationProject.getId());
        
        results.add(valResult);
//        report.addResult(valResult);
//        Logger.getLogger("logger").log(Level.INFO,   "Calculated agreement: " + totalAgreement);
      }
      
      ParagraphAgreement avgReportAgreement = Agreement.calculateAverageAgreement(validationCoderAvg);
      report.setParagraphAgreement(avgReportAgreement);
      
      generateAgreementMaps(report.getDocumentResults(), originalDocs);

      mgr.makePersistent(report);
      
      Logger.getLogger("logger").log(Level.INFO,   "Farming out: " + results.size() + " Results");
      
      for (ValidationResult result : results) {
        result.setReportID(report.getId());
//        mgr.makePersistent(result);
        DeferredResults deferredResults = new DeferredResults(result);
        Queue queue = QueueFactory.getDefaultQueue();
        queue.add(com.google.appengine.api.taskqueue.TaskOptions.Builder.withPayload(deferredResults));
      }
     // mgr.makePersistentAll(results);

    } catch (UnauthorizedException e) {
      Logger.getLogger("logger").log(Level.INFO,   "User not authorized: " + user.getEmail());
      // TODO Auto-generated catch block
      e.printStackTrace();
    } finally {
      mgr.close();
    }
    long elapsed = System.nanoTime() - startTime;
    Logger.getLogger("logger").log(Level.INFO,   "Time for ValidationReport: " + elapsed);
    
  }
  
  private void generateAgreementMaps(List<DocumentResult> documentResults, Collection<TextDocument> originalDocs) {
//    Logger.getLogger("logger").log(Level.INFO,   "originalDocs: "+ originalDocs+" documentResults: "+ documentResults);
    for (TextDocument textDocument : originalDocs) {
      for (DocumentResult documentResult : documentResults) {
        //Logger.getLogger("logger").log(Level.INFO,   "documentResultDocID: "+ documentResult.getDocumentID()+" docID: "+ textDocument.getId());
        if (documentResult.getDocumentID().equals(textDocument.getId())){
          Logger.getLogger("logger").log(Level.INFO,   "Generating map for: " + textDocument.getId());
          documentResult.generateAgreementMap(textDocument);
          break;
        }
        
      }
    }
    
  }
  
  private static PersistenceManager getPersistenceManager() {
    return PMF.get().getPersistenceManager();
  }

}
