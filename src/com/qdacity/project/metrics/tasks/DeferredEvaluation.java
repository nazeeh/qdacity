package com.qdacity.project.metrics.tasks;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.inject.Named;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;

import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.memcache.Expiration;
import com.google.appengine.api.memcache.MemcacheService;
import com.google.appengine.api.memcache.MemcacheServiceFactory;
import com.google.appengine.api.taskqueue.DeferredTask;
import com.google.appengine.api.taskqueue.Queue;
import com.google.appengine.api.taskqueue.QueueFactory;
import com.google.appengine.api.taskqueue.TaskHandle;
import com.google.appengine.api.users.User;
import com.qdacity.PMF;
import com.qdacity.project.ValidationProject;
import com.qdacity.project.data.TextDocument;
import com.qdacity.project.data.TextDocumentEndpoint;
import com.qdacity.project.metrics.Agreement;
import com.qdacity.project.metrics.DocumentResult;
import com.qdacity.project.metrics.ParagraphAgreement;
import com.qdacity.project.metrics.ValidationEndpoint;
import com.qdacity.project.metrics.ValidationReport;
import com.qdacity.project.metrics.ValidationResult;
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
    
    PersistenceManager mgr = getPersistenceManager();
    try {
      TextDocumentEndpoint tde = new TextDocumentEndpoint();
      Query q;
      q = mgr.newQuery(ValidationProject.class, "revisionID  == :revisionID");
      
      Map<String, Long> params = new HashMap();
      params.put("revisionID", revisionID);

      Collection<TextDocument> originalDocs = tde.getTextDocument(revisionID, "REVISION", user).getItems(); // FIXME put in Memcache, so for each validationResult it does not have to be fetched again
      List<Long> orignalDocIDs = new ArrayList<Long>();
      for (TextDocument textDocument : originalDocs) {
        
        if (docIDs.contains(textDocument.getId())){
          String keyString = KeyFactory.createKeyString(TextDocument.class.toString(), textDocument.getId());
          MemcacheService syncCache = MemcacheServiceFactory.getMemcacheService();
          syncCache.put(keyString, textDocument,Expiration.byDeltaSeconds(300));
          
          orignalDocIDs.add(textDocument.getId());
        }
      }

      List<ValidationProject> validationProjects = (List<ValidationProject>)q.executeWithMap(params);
      
      for (ValidationProject prj : validationProjects) {
        prj.getId();
      }
      
      ValidationReport report = new ValidationReport();
      mgr.makePersistent(report); //  Generate ID right away so we have an ID to pass to ValidationResults
      
      report.setRevisionID(revisionID);
      report.setName(name);
      report.setDatetime(new Date());
      
      List<ValidationResult> results = new ArrayList<ValidationResult>();
      report.setProjectID(validationProjects.get(0).getProjectID());
      
      List<DocumentResult> docResults = new ArrayList<DocumentResult>();
      Map<Long,List<ParagraphAgreement>> agreementByDoc = new HashMap<Long,List<ParagraphAgreement>>();
      
      List<Future<TaskHandle>> futures = new ArrayList<Future<TaskHandle>>();
      
      for (ValidationProject validationProject : validationProjects) {
        validationProject.getId(); // Lazy Fetch?
        Logger.getLogger("logger").log(Level.INFO,   "Starting ValidationProject : " + validationProject.getId());
        DeferredValPrjEvaluation deferredResults = new DeferredValPrjEvaluation(validationProject, docIDs, orignalDocIDs, report.getId(), user);

        Queue queue = QueueFactory.getQueue("ValidationResultQueue");
        
        Future<TaskHandle> future = queue.addAsync(com.google.appengine.api.taskqueue.TaskOptions.Builder.withPayload(deferredResults));

        futures.add(future);
      }
      
      Logger.getLogger("logger").log(Level.INFO,   "Waiting for tasks: "+futures.size() );
      
      for (Future<TaskHandle> future : futures) {
        Logger.getLogger("logger").log(Level.INFO,   "Is task finished? : "+future.isDone() );
        future.get();
      }
      
      // Poll every 10 seconds. TODO: find better solution
      List<ValidationResult> valResults = new ArrayList<ValidationResult>();
      while (valResults.size() != validationProjects.size()) {
        
        ValidationEndpoint ve = new ValidationEndpoint();
        valResults = ve.listValidationResults(report.getId(), user);
        Logger.getLogger("logger").log(Level.WARNING, " So many results " + valResults.size() + " for report " + report.getId() + " at time "  + System.currentTimeMillis());
        if (valResults.size() != validationProjects.size()){
          Thread.sleep(10000);
        }
      }
      
      
      
      Logger.getLogger("logger").log(Level.INFO,   "All Tasks Done for tasks: ");
      Logger.getLogger("logger").log(Level.INFO,   "Is task finished? : "+futures.get(0).isDone() );
      
      aggregateDocAgreement(report);
      
      Logger.getLogger("logger").log(Level.INFO,   "Generating Agreement Map for report : "+report.getDocumentResults().size() );
      
      Agreement.generateAgreementMaps(report.getDocumentResults(), originalDocs);

      mgr.makePersistent(report);

    } catch (UnauthorizedException e) {
      Logger.getLogger("logger").log(Level.INFO,   "User not authorized: " + user.getEmail());
      // TODO Auto-generated catch block
      e.printStackTrace();
    } catch (InterruptedException e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
    } catch (ExecutionException e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
    } finally {
      mgr.close();
    }
    long elapsed = System.nanoTime() - startTime;
    Logger.getLogger("logger").log(Level.WARNING,   "Time for ValidationReport: " + elapsed);
    
  }

  
  private void aggregateDocAgreement(ValidationReport report) throws UnauthorizedException{
    List<ParagraphAgreement> validationCoderAvg = new ArrayList<ParagraphAgreement>(); 
    Map<Long,List<ParagraphAgreement>> agreementByDoc = new HashMap<Long,List<ParagraphAgreement>>();
    
    ValidationEndpoint ve = new ValidationEndpoint();
    List<ValidationResult> validationResults = ve.listValidationResults(report.getId(), user);
    Logger.getLogger("logger").log(Level.WARNING, " So many results " + validationResults.size() + " for report " + report.getId() + " at time "  + System.currentTimeMillis());
    for (ValidationResult validationResult : validationResults) {
      ParagraphAgreement resultParagraphAgreement = validationResult.getParagraphAgreement();
      if (!(resultParagraphAgreement.getPrecision() == 1 && resultParagraphAgreement.getRecall() == 0)) validationCoderAvg.add(resultParagraphAgreement);
      
      List<DocumentResult> docResults = ve.listDocumentResults(validationResult.getId(), user);
      
      for (DocumentResult documentResult : docResults) {
        Long revisionDocumentID = documentResult.getOriginDocumentID();
        
        DocumentResult documentResultForAggregation = new DocumentResult(documentResult);
        documentResultForAggregation.setDocumentID(revisionDocumentID);
        report.addDocumentResult(documentResultForAggregation);
        
        ParagraphAgreement docAgreement = documentResultForAggregation.getParagraphAgreement();
        
        if (!(docAgreement.getPrecision() == 1 && docAgreement.getRecall() == 0)){
//        documentAverage.add(documentAgreement.getParagraphAgreement());
          List<ParagraphAgreement> agreementList = agreementByDoc.get(revisionDocumentID);
          if (agreementList == null) agreementList = new ArrayList<ParagraphAgreement>();
          agreementList.add(docAgreement);
          agreementByDoc.put(revisionDocumentID, agreementList);
          //agreementByDoc.putIfAbsent(key, value)
        }
        
      }
      
    }
    
    for (Long docID : agreementByDoc.keySet()) {
      ParagraphAgreement avgDocAgreement = Agreement.calculateAverageAgreement(agreementByDoc.get(docID));
      Logger.getLogger("logger").log(Level.INFO,   "From " + agreementByDoc.get(docID).size() + " items, we calculated an F-Measuzre of " + avgDocAgreement.getfMeasure());
      report.setDocumentResultAverage(docID, avgDocAgreement);
    }
    
    ParagraphAgreement avgReportAgreement = Agreement.calculateAverageAgreement(validationCoderAvg);
    report.setParagraphAgreement(avgReportAgreement);
  }
  
  private static PersistenceManager getPersistenceManager() {
    return PMF.get().getPersistenceManager();
  }

}
