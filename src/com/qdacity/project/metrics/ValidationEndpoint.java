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
import com.google.appengine.api.users.User;
import com.google.appengine.labs.repackaged.org.json.JSONException;
import com.qdacity.Constants;
import com.qdacity.PMF;
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
        List<ValidationResult> results = validationReport.getValidationResult();
        for (ValidationResult result : results) {
          result.getName();
          result.getParagraphAgreement();
          result.getRevisionId();
          result.getValidationProjectID();
          List<DocumentResult> docResults = result.getDocumentResults();
          for (DocumentResult documentResult : docResults) {
            documentResult.getDocumentID();
            documentResult.getDocumentName();
            documentResult.getParagraphAgreement();
          }
        }
      }
    } finally {
      mgr.close();
    }
    return reports;
  }

  @ApiMethod(name = "validation.evaluateRevision",   scopes = {Constants.EMAIL_SCOPE},
      clientIds = {Constants.WEB_CLIENT_ID, 
         com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
         audiences = {Constants.WEB_CLIENT_ID})
  public List<ValidationProject> evaluateRevision(@Named("revisionID") Long revisionID, @Named("name") String name, @Named("docs") String docIDsString, User user) throws UnauthorizedException {
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
      
      for (ValidationProject validationProject : validationProjects) {
        report.setProjectID(validationProject.getProjectID());     
        
        ValidationResult valResult = new ValidationResult(); 

        List<ParagraphAgreement> documentAgreements = new ArrayList<ParagraphAgreement>();
        Collection<TextDocument> recodedDocs = tde.getTextDocument(validationProject.getId(), "VALIDATION", user).getItems();
        Logger.getLogger("logger").log(Level.INFO,   "Number of original docs: " + originalDocs.size() + " Number of recoded docs: "+ recodedDocs.size());
        Logger.getLogger("logger").log(Level.INFO,   "Docs to evaluate: " + docIDs.toArray().toString());
        for (TextDocument original : originalDocs) {
         if (!docIDs.contains(original.getId())) continue; // Exclude text documents that should not be considered
         for (TextDocument recoded : recodedDocs) {
           if (original.getTitle().equals(recoded.getTitle())){
             ParagraphAgreement documentAgreement = Agreement.calculateParagraphAgreement(original, recoded);
             documentAgreements.add(documentAgreement);
             DocumentResult docResults= new DocumentResult();
             docResults.setDocumentID(recoded.getId());
             docResults.setDocumentName(recoded.getTitle());
             docResults.setParagraphAgreement(documentAgreement);
             valResult.addDocumentResult(docResults);
           }
         }
       }
        
        ParagraphAgreement totalAgreement = Agreement.calculateAverageAgreement(documentAgreements);
        if (!(totalAgreement.getPrecision() == 1 && totalAgreement.getRecall() == 0)) validationCoderAvg.add(totalAgreement); // We exclude validationproject where nothing was coded (recall 0 prec 1) from calculation of avg
        
        valResult.setParagraphAgreement(totalAgreement);
        valResult.setName(validationProject.getCreatorName());
        valResult.setRevisionID(revisionID);
        valResult.setValidationProjectID(validationProject.getId());
        
        report.addResult(valResult);
       
        Logger.getLogger("logger").log(Level.INFO,   "Calculated agreement: " + totalAgreement);
      }
      
      ParagraphAgreement avgReportAgreement = Agreement.calculateAverageAgreement(validationCoderAvg);
      report.setParagraphAgreement(avgReportAgreement);
      mgr.makePersistent(report);

    } finally {
      mgr.close();
    }
    return validationProjects;
  }
  
  @ApiMethod(name = "validation.sendNotificationEmail",   scopes = {Constants.EMAIL_SCOPE},
      clientIds = {Constants.WEB_CLIENT_ID, 
         com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
         audiences = {Constants.WEB_CLIENT_ID})
  public void sendNotificationEmail(@Named("reportID") Long reportID, User user) throws UnauthorizedException, JSONException {
    
    PersistenceManager mgr = getPersistenceManager();
    
    
    try {
      ValidationReport report = mgr.getObjectById(ValidationReport.class, reportID);
      
      List<ValidationResult> results = report.getValidationResult();
      
      for (ValidationResult result : results) {
        Sendgrid mail = new Sendgrid(Credentials.SENDGRID_USER ,Credentials.SENDGRID_PW);
        Long prjID = result.getValidationProjectID();
        ValidationProject project =  mgr.getObjectById(ValidationProject.class, prjID);
        List<String> coderIDs = project.getValidationCoders();
        
        for (String coderID : coderIDs) {
          com.qdacity.user.User coder =  mgr.getObjectById(com.qdacity.user.User.class, coderID);
          mail.addTo(coder.getEmail(), coder.getGivenName() + " " +coder.getSurName());
        }
        
        String msgBody = "Hi,<br>";
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
        List<DocumentResult> docResults = result.getDocumentResults();
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
