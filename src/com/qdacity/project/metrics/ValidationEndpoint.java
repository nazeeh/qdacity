package com.qdacity.project.metrics;

import java.util.ArrayList;
import java.util.Collection;
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
import com.qdacity.Constants;
import com.qdacity.PMF;
import com.qdacity.project.ProjectRevision;
import com.qdacity.project.ValidationProject;
import com.qdacity.project.data.TextDocument;
import com.qdacity.project.data.TextDocumentEndpoint;

@Api(name = "qdacity", namespace = @ApiNamespace(ownerDomain = "qdacity.com", ownerName = "qdacity.com", packagePath = "server.project"))
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
      
     
    } finally {
      mgr.close();
    }
    return reports;
  }

  @ApiMethod(name = "validation.evaluateRevision",   scopes = {Constants.EMAIL_SCOPE},
      clientIds = {Constants.WEB_CLIENT_ID, 
         com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
         audiences = {Constants.WEB_CLIENT_ID})
  public List<ValidationProject> evaluateRevision(@Named("revisionID") Long revisionID, User user) throws UnauthorizedException {
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
      
      ValidationReport report = new ValidationReport();
      report.setRevisionID(revisionID);
      
      for (ValidationProject validationProject : validationProjects) {
        report.setProjectID(validationProject.getProjectID());
        
        ValidationResult valResult = new ValidationResult(); 
        valResult.setName(validationProject.getCreatorName());
        valResult.setRevisionID(revisionID);
        valResult.setValidationProjectID(validationProject.getId());

        List<Double> documentAgreements = new ArrayList<Double>();
        Collection<TextDocument> recodedDocs = tde.getTextDocument(validationProject.getId(), "VALIDATION", user).getItems();
        Logger.getLogger("logger").log(Level.INFO,   "Number of original docs: " + originalDocs.size() + " Number of recoded docs: "+ recodedDocs.size());
        for (TextDocument original : originalDocs) {
         for (TextDocument recoded : recodedDocs) {
           if (original.getTitle().equals(recoded.getTitle())){
             double documentAgreement = Agreement.calculateParagraphAgreement(original, recoded);
             documentAgreements.add(documentAgreement);
           }
         }
       }
        
        double totalAgreement = Agreement.calculateAverageAgreement(documentAgreements);

        valResult.setParagraphFMeasure(totalAgreement);
        
        report.addResult(valResult);
       
        Logger.getLogger("logger").log(Level.INFO,   "Calculated agreement: " + totalAgreement);
        validationProject.setParagraphFMeasure(totalAgreement);
        mgr.makePersistent(validationProject);
        
      }
      
      
      mgr.makePersistent(report);
      
      
      

    } finally {
      mgr.close();
    }
    return validationProjects;
  }

  
  private static PersistenceManager getPersistenceManager() {
    return PMF.get().getPersistenceManager();
  }
}
