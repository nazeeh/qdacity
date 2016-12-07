package com.qdacity.project.metrics;

import java.text.DateFormat;
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

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.taskqueue.Queue;
import com.google.appengine.api.taskqueue.QueueFactory;
import com.google.appengine.api.users.User;
import com.google.appengine.labs.repackaged.org.json.JSONException;
import com.qdacity.Constants;
import com.qdacity.PMF;
import com.qdacity.project.Project;
import com.qdacity.project.ValidationProject;
import com.qdacity.project.data.TextDocument;
import com.qdacity.project.data.TextDocumentEndpoint;
import com.qdacity.Sendgrid;
import com.qdacity.Credentials;;

@Api(name = "qdacity", version = "v3", namespace = @ApiNamespace(ownerDomain = "qdacity.com", ownerName = "qdacity.com", packagePath = "server.project"))
public class ValidationEndpoint {

  @ApiMethod(name = "validation.listReports",   scopes = {Constants.EMAIL_SCOPE},
      clientIds = {Constants.WEB_CLIENT_ID, 
         com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
         audiences = {Constants.WEB_CLIENT_ID})
  public List<ValidationReport> listReports(@Named("projectID") Long prjID, User user) throws UnauthorizedException {
    List<ValidationReport> reports = new ArrayList<ValidationReport>();
    PersistenceManager mgr = getPersistenceManager();
    try {
      
      Query q;
      q = mgr.newQuery(ValidationReport.class, " projectID  == :projectID");
      
      Map<String, Long> params = new HashMap();
      params.put("projectID", prjID);
      
      reports  = (List<ValidationReport>)q.executeWithMap(params);

      for (ValidationReport validationReport : reports) {
        validationReport.getParagraphAgreement().getFMeasure();
        List<DocumentResult> docresults = validationReport.getDocumentResults();
        if (docresults.size() > 0){
          for (DocumentResult documentResult : docresults) {
            documentResult.getParagraphAgreement().getfMeasure();
          }
        }
          

        
//        List<ValidationResult> results = validationReport.getValidationResult();
//        if (results != null){
//          for (ValidationResult result : results) {
//            result.getName();
//            result.getParagraphAgreement();
//            result.getRevisionId();
//            result.getValidationProjectID();
//            List<DocumentResult> docResults = result.getDocumentResults();
//            for (DocumentResult documentResult : docResults) {
//              if (documentResult != null){
//                documentResult.getDocumentID();
//                documentResult.getDocumentName();
//                documentResult.getParagraphAgreement();
//              }
//              
//            }
//          }
//        }
        
      }
    } finally {
      mgr.close();
    }
    return reports;
  }
  
  @ApiMethod(name = "validation.listValidationResults",   scopes = {Constants.EMAIL_SCOPE},
      clientIds = {Constants.WEB_CLIENT_ID, 
         com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
         audiences = {Constants.WEB_CLIENT_ID})
  public List<ValidationResult> listValidationResults(@Named("reportID") Long reportID, User user) throws UnauthorizedException {
    List<ValidationReport> reports = new ArrayList<ValidationReport>();
    PersistenceManager mgr = getPersistenceManager();
    List<ValidationResult> results = new ArrayList<ValidationResult>();
    
    try {
      
      Query q = mgr.newQuery(ValidationResult.class, "reportID  == :reportID");
      Map<String, Long> params = new HashMap();
      params.put("reportID", reportID);

      results = (List<ValidationResult>) q.execute(reportID);
      
      // Lazy fetch
      for (ValidationResult result : results) {
        result.getParagraphAgreement().getFMeasure();
      }
      
    } finally {
      mgr.close();
    }
    return results;
  }
  
  @ApiMethod(name = "validation.listDocumentResults",   scopes = {Constants.EMAIL_SCOPE},
      clientIds = {Constants.WEB_CLIENT_ID, 
         com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
         audiences = {Constants.WEB_CLIENT_ID})
  public List<DocumentResult> listDocumentResults(@Named("validationRresultID") Long validationRresultID, User user) throws UnauthorizedException {
    List<ValidationReport> reports = new ArrayList<ValidationReport>();
    PersistenceManager mgr = getPersistenceManager();
    List<DocumentResult> results = new ArrayList<DocumentResult>();
    
    try {
      
      Query q = mgr.newQuery(DocumentResult.class, "validationResultID  == :validationResultID");
      Map<String, Long> params = new HashMap();
      params.put("validationResultID", validationRresultID);

      results = (List<DocumentResult>) q.execute(validationRresultID);
      
      // Lazy fetch
      for (DocumentResult result : results) {
        result.getParagraphAgreement().getFMeasure();
      }
      
    } finally {
      mgr.close();
    }
    return results;
  }

  @ApiMethod(name = "validation.evaluateRevision",   scopes = {Constants.EMAIL_SCOPE},
      clientIds = {Constants.WEB_CLIENT_ID, 
         com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
         audiences = {Constants.WEB_CLIENT_ID})
  public List<ValidationProject> evaluateRevision(@Named("revisionID") Long revisionID, @Named("name") String name, @Named("docs") String docIDsString, User user) throws UnauthorizedException {
    
    DeferredEvaluation task = new DeferredEvaluation(revisionID, name, docIDsString, user);
    // Set instance variables etc as you wish
   Queue queue = QueueFactory.getDefaultQueue();
   queue.add(com.google.appengine.api.taskqueue.TaskOptions.Builder.withPayload(task));
 
 
    
    return null;
  }
  
  private void generateAgreementMaps(List<DocumentResult> documentResults, Collection<TextDocument> originalDocs) {
    Logger.getLogger("logger").log(Level.INFO,   "originalDocs: "+ originalDocs+" documentResults: "+ documentResults);
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

  @ApiMethod(name = "validation.sendNotificationEmail",   scopes = {Constants.EMAIL_SCOPE},
      clientIds = {Constants.WEB_CLIENT_ID, 
         com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
         audiences = {Constants.WEB_CLIENT_ID})
  public void sendNotificationEmail(@Named("reportID") Long reportID, User user) throws UnauthorizedException, JSONException {
    
    PersistenceManager mgr = getPersistenceManager();
    
    
    try {
      ValidationReport report = mgr.getObjectById(ValidationReport.class, reportID);
      // FIXME
      List<ValidationResult> results;
      
      Query q2 = mgr.newQuery(ValidationResult.class, "reportID  == :reportID");
//    Map<String, Long> params = new HashMap();
//    params.put("reportID", repID);
    results = (List<ValidationResult>) q2.execute(reportID);


      
//      List<ValidationResult> results = report.getValidationResult();
      
      for (ValidationResult result : results) {
        Sendgrid mail = new Sendgrid(Credentials.SENDGRID_USER ,Credentials.SENDGRID_PW);
        Long prjID = result.getValidationProjectID();
        ValidationProject project =  mgr.getObjectById(ValidationProject.class, prjID);
        List<String> coderIDs = project.getValidationCoders();
        String greetingName = "";
        for (String coderID : coderIDs) {
          com.qdacity.user.User coder =  mgr.getObjectById(com.qdacity.user.User.class, coderID);
          Logger.getLogger("logger").log(Level.INFO,   "Sending notification mail to: " + coder.getGivenName() + " " +coder.getSurName());
          mail.addTo(coder.getEmail(), coder.getGivenName() + " " +coder.getSurName());
          greetingName += coder.getGivenName() +", ";
        }
        mail.addTo("kaufmann@group.riehle.org", "Andreas Kaufmann");
        String msgBody = "Hi "+greetingName+"<br>";
        msgBody += "<p>";
        msgBody +="We have analyzed your codings, and you've achieved the following scores:<br>";
        msgBody += "</p>";
        msgBody += "<p>";
        msgBody +="<strong>Overall</strong> <br>";
        msgBody +="F-Measure: "+result.getParagraphAgreement().getFMeasure()+"<br>";
        msgBody +="Recall: "+result.getParagraphAgreement().getRecall()+"<br>";
        msgBody +="Precision: "+result.getParagraphAgreement().getPrecision()+"<br>";
        msgBody += "</p>";
        msgBody += "<p>";
        msgBody +="<strong>Document specific data:</strong><br>";
        msgBody += "</p>";
        
        
        List<DocumentResult> docResults = listDocumentResults(result.getId(), user);
        for (DocumentResult documentResult : docResults) {
          msgBody += "<p>";
          msgBody +="<strong>"+documentResult.getDocumentName()+":</strong><br>";
          msgBody +="F-Measure: "+documentResult.getParagraphAgreement().getFMeasure()+"<br>";
          msgBody +="Recall: "+documentResult.getParagraphAgreement().getRecall()+"<br>";
          msgBody +="Precision: "+documentResult.getParagraphAgreement().getPrecision()+"<br><br>";
          msgBody += "</p>";
        }
        
        msgBody += "<p>";
        msgBody +="You may compare these values to the average of this report<br>";
        msgBody +="F-Measure: "+report.getParagraphAgreement().getFMeasure()+"<br>";
        msgBody +="Recall: "+report.getParagraphAgreement().getRecall()+"<br>";
        msgBody +="Precision: "+report.getParagraphAgreement().getPrecision()+"<br><br>";
        msgBody += "</p>";
        
        msgBody += "<p>";
        msgBody +="This email is generated for this report: "+report.getName()+"<br>";
        String reportTime = DateFormat.getDateInstance().format(report.getDatetime());
        
        msgBody +="Date of this report: "+reportTime+"<br>";
        
        msgBody += "<p>";
        msgBody +="Best regards,<br>";
        msgBody +="QDAcity Mailbot<br>";
        msgBody += "</p>";
        
        mail.setFrom("QDAcity <support@qdacity.com>");
        mail.setSubject("QDAcity Report");
        mail.setText(" ").setHtml(msgBody);
        
        mail.send();
        
        Logger.getLogger("logger").log(Level.INFO,   mail.getServerResponse());
        
      }
    } finally {
      mgr.close();
    }
   
     
  }
  
  @ApiMethod(name = "validation.deleteReport",   scopes = {Constants.EMAIL_SCOPE},
      clientIds = {Constants.WEB_CLIENT_ID, 
         com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
         audiences = {Constants.WEB_CLIENT_ID})
  public List<ValidationReport> deleteReport(@Named("reportID") Long repID, User user) throws UnauthorizedException {
    List<ValidationReport> reports = new ArrayList<ValidationReport>(); //FIXME Why?
    PersistenceManager mgr = getPersistenceManager();
    try {
      ValidationReport report = mgr.getObjectById(ValidationReport.class, repID);
      
      List<ValidationResult> results;
      
      if (report.getValidationResultIDs().size() > 0){
     // Delete all ValidationResults / old - linked from report
        Query q = mgr.newQuery(ValidationResult.class, ":p.contains(id)");
        results = (List<ValidationResult>) q.execute(report.getValidationResultIDs());
        mgr.deletePersistentAll(results);
      }else {
     // Delete all ValidationResults / new - foreign key in result
        Query q2 = mgr.newQuery(ValidationResult.class, "reportID  == :reportID");
//        Map<String, Long> params = new HashMap();
//        params.put("reportID", repID);
        results = (List<ValidationResult>) q2.execute(repID);
        
        //Delete all DocumentResults corresponding to the ValidationResults
        for (ValidationResult validationResult : results) {
          Query q3 = mgr.newQuery(DocumentResult.class, "validationResultID  == :validationResultID");
          List<DocumentResult> docResults = (List<DocumentResult>) q3.execute(validationResult.getId());
          if (docResults != null){
//            for (DocumentResult documentResult : docResults) {
//              mgr.deletePersistent(documentResult);
//            }
          
          
          if (docResults != null && !docResults.isEmpty()) {
            mgr.deletePersistentAll(docResults);
          }
          }
        }
        
        mgr.deletePersistentAll(results);
      }
      
      

      
      //Delete the actual report      
      mgr.deletePersistent(report);
      
      
      
    } finally {
      mgr.close();
    }
    return reports;
  }

  
  private static PersistenceManager getPersistenceManager() {
    return PMF.get().getPersistenceManager();
  }
}
