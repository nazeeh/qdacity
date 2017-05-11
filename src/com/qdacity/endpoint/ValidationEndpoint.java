package com.qdacity.endpoint;

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
import com.google.appengine.api.taskqueue.Queue;
import com.google.appengine.api.taskqueue.QueueFactory;
import com.google.appengine.api.users.User;
import com.qdacity.Constants;
import com.qdacity.PMF;
import com.qdacity.project.ValidationProject;
import com.qdacity.project.data.TextDocument;
import com.qdacity.project.metrics.DocumentResult;
import com.qdacity.project.metrics.TabularValidationReport;
import com.qdacity.project.metrics.TabularValidationReportRow;
import com.qdacity.project.metrics.ValidationReport;
import com.qdacity.project.metrics.ValidationResult;
import com.qdacity.project.metrics.tasks.DeferredEmailNotification;
import com.qdacity.project.metrics.tasks.DeferredEvaluation;
import com.qdacity.project.metrics.tasks.DeferredReportDeletion;
import javax.annotation.Nullable;


@Api(
	name = "qdacity",
	version = Constants.VERSION,
	namespace = @ApiNamespace(
		ownerDomain = "qdacity.com",
		ownerName = "qdacity.com",
		packagePath = "server.project"))
public class ValidationEndpoint {

	@SuppressWarnings("unchecked")
	@ApiMethod(
		name = "validation.listReports",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public List<ValidationReport> listReports(@Named("projectID") Long prjID, User user) throws UnauthorizedException {
		List<ValidationReport> reports = new ArrayList<>();
		PersistenceManager mgr = getPersistenceManager();
		try {
			Query q;
			q = mgr.newQuery(ValidationReport.class, " projectID  == :projectID");

			Map<String, Long> params = new HashMap<>();
			params.put("projectID", prjID);

			reports = (List<ValidationReport>) q.executeWithMap(params);

			for (ValidationReport validationReport : reports) {
				if (validationReport.getAverageAgreementRow()!= null) validationReport.getAverageAgreementRow().getCells();
				List<DocumentResult> docresults = validationReport.getDocumentResults();
				if (docresults.size() > 0) {
					for (DocumentResult documentResult : docresults) {
						documentResult.getReportRow().getCells();
					}
				}
			}
		} finally {
			mgr.close();
		}
		return reports;
	}
	
    @SuppressWarnings("unchecked")
    @ApiMethod(
	    name = "validation.listTabularReports",
	    scopes = {Constants.EMAIL_SCOPE},
	    clientIds = {Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
	    audiences = {Constants.WEB_CLIENT_ID})
    public List<TabularValidationReport> listTabularReports(@Named("projectID") Long prjID, User user) throws UnauthorizedException {
	List<TabularValidationReport> tabularReports = new ArrayList<>();
	PersistenceManager mgr = getPersistenceManager();
	try {
	    Query q;
	    q = mgr.newQuery(TabularValidationReport.class, " projectID  == :projectID");

	    Map<String, Long> params = new HashMap<>();
	    params.put("projectID", prjID);

	    tabularReports = (List<TabularValidationReport>) q.executeWithMap(params);
	} finally {
	    mgr.close();
	}

	return tabularReports;
    }
    
    @SuppressWarnings("unchecked")
    @ApiMethod(
	    name = "validation.listTabularReportRows",
	    scopes = {Constants.EMAIL_SCOPE},
	    clientIds = {Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
	    audiences = {Constants.WEB_CLIENT_ID})
    public List<TabularValidationReportRow> listTabularReportsRows(@Named("tabularValidationReportId") Long tabularValidationReportId, User user) throws UnauthorizedException {
	List<TabularValidationReportRow> tabularReportRows = new ArrayList<>();
	PersistenceManager mgr = getPersistenceManager();
	try {
	    Query q;
	    q = mgr.newQuery(TabularValidationReportRow.class, " tabularValidationReportId  == :tabularValidationReportId ");

	    Map<String, Long> params = new HashMap<>();
	    params.put("tabularValidationReportId", tabularValidationReportId);

	    tabularReportRows = (List<TabularValidationReportRow>) q.executeWithMap(params);
	} finally {
	    mgr.close();
	}

	return tabularReportRows;
    }

	@SuppressWarnings("unchecked")
	@ApiMethod(
		name = "validation.listValidationResults",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public List<ValidationResult> listValidationResults(@Named("reportID") Long reportID, User user) throws UnauthorizedException {
		PersistenceManager mgr = getPersistenceManager();
		List<ValidationResult> results = new ArrayList<ValidationResult>();

		try {

			Query q = mgr.newQuery(ValidationResult.class, "reportID  == :reportID");
			Map<String, Long> params = new HashMap<String, Long>();
			params.put("reportID", reportID);

			results = (List<ValidationResult>) q.execute(reportID);

			// Lazy fetch
			for (ValidationResult result : results) {
			    if(result.getReportRow()!=null) {
				result.getReportRow().getCells();
			    }
			}

		} finally {
			mgr.close();
		}
		return results;
	}

	@SuppressWarnings("unchecked")
	@ApiMethod(
		name = "validation.listDocumentResults",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public List<DocumentResult> listDocumentResults(@Named("validationRresultID") Long validationRresultID, User user) throws UnauthorizedException {
		PersistenceManager mgr = getPersistenceManager();
		List<DocumentResult> results = new ArrayList<DocumentResult>();

		try {

			Query q = mgr.newQuery(DocumentResult.class, "validationResultID  == :validationResultID");
			Map<String, Long> params = new HashMap<String, Long>();
			params.put("validationResultID", validationRresultID);

			results = (List<DocumentResult>) q.execute(validationRresultID);

			// Lazy fetch
			for (DocumentResult result : results) {
				result.getReportRow().getCells();
				result.getAgreementMap();
			}

		} finally {
			mgr.close();
		}
		return results;
	}

	@SuppressWarnings("unchecked")
	@ApiMethod(
		name = "validation.getValidationResult",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public ValidationResult getValidationResultID(@Named("reportID") Long reportID, @Named("validationProjectID") Long validationProjectID, User user) throws UnauthorizedException {
		PersistenceManager mgr = getPersistenceManager();
		ValidationResult result;

		try {
			Query q = mgr.newQuery(ValidationResult.class, "validationProjectID  == :validationProjectID  &&  reportID == :reportID");
			Map<String, Long> params = new HashMap<String, Long>();
			params.put("validationProjectID", validationProjectID);
			params.put("reportID", reportID);
			result = ((List<ValidationResult>) q.executeWithMap(params)).get(0);

		} finally {
			mgr.close();
		}
		return result;
	}

	@ApiMethod(
		name = "validation.evaluateRevision",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public List<ValidationProject> evaluateRevision(@Named("revisionID") Long revisionID, @Named("name") String name, @Named("docs") String docIDsString, @Named("method") String evaluationMethod, @Named("unit") String unitOfCoding, @Named("raterIds")  @Nullable String raterIds, User user) throws UnauthorizedException {

		DeferredEvaluation task = new DeferredEvaluation(revisionID, name, docIDsString, evaluationMethod, unitOfCoding, raterIds, user);
		// Set instance variables etc as you wish
		Queue queue = QueueFactory.getDefaultQueue();
		queue.add(com.google.appengine.api.taskqueue.TaskOptions.Builder.withPayload(task));

		return null;
	}

	private void generateAgreementMaps(List<DocumentResult> documentResults, Collection<TextDocument> originalDocs) {
		Logger.getLogger("logger").log(Level.INFO, "originalDocs: " + originalDocs + " documentResults: " + documentResults);
		for (TextDocument textDocument : originalDocs) {
			for (DocumentResult documentResult : documentResults) {
				if (documentResult.getDocumentID().equals(textDocument.getId())) {
					Logger.getLogger("logger").log(Level.INFO, "Generating map for: " + textDocument.getId());
					documentResult.generateAgreementMap(textDocument);
					break;
				}

			}
		}

	}

	@ApiMethod(
		name = "validation.sendNotificationEmail",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public void sendNotificationEmail(@Named("reportID") Long reportID, User user) throws UnauthorizedException {

		DeferredEmailNotification task = new DeferredEmailNotification(reportID, user);
		// Set instance variables etc as you wish
		Queue queue = QueueFactory.getDefaultQueue();
		queue.add(com.google.appengine.api.taskqueue.TaskOptions.Builder.withPayload(task));
	}

	@SuppressWarnings("unchecked")
	@ApiMethod(
		name = "validation.deleteReport",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public List<ValidationReport> deleteReport(@Named("reportID") Long repID, User user) throws UnauthorizedException {
		List<ValidationReport> reports = new ArrayList<>(); // FIXME Why?
		PersistenceManager mgr = getPersistenceManager();
		try {
			ValidationReport report = mgr.getObjectById(ValidationReport.class, repID);

			List<ValidationResult> results;

			if (report.getValidationResultIDs().size() > 0) {
				// Delete all ValidationResults / old - linked from report
				Query q = mgr.newQuery(ValidationResult.class, ":p.contains(id)");
				results = (List<ValidationResult>) q.execute(report.getValidationResultIDs());
				mgr.deletePersistentAll(results);
			} else {
				DeferredReportDeletion task = new DeferredReportDeletion(repID);
				Queue queue = QueueFactory.getDefaultQueue();
				queue.add(com.google.appengine.api.taskqueue.TaskOptions.Builder.withPayload(task));
			}

			// Lazy fetch
			List<DocumentResult> docResults = report.getDocumentResults();
			for (DocumentResult documentResult : docResults) {
				documentResult.getAgreementMap();
				documentResult.getReportRow().getCells();
			}

			// Delete the actual report
			mgr.deletePersistent(report);

		} finally {
			mgr.close();
		}
		return reports;
	}
	
    @SuppressWarnings("unchecked")
    @ApiMethod(
	    name = "validation.deleteTabularReport",
	    scopes = {Constants.EMAIL_SCOPE},
	    clientIds = {Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
	    audiences = {Constants.WEB_CLIENT_ID})
    public void deleteTabularReport(@Named("reportID") Long repID, User user) throws UnauthorizedException {
	PersistenceManager mgr = getPersistenceManager();
	try {
	    TabularValidationReport tabularReport = mgr.getObjectById(TabularValidationReport.class, repID);

	    Query rowsQuery = mgr.newQuery(TabularValidationReportRow.class, "tabularValidationReportId  == :tabularValidationReportId");
	    @SuppressWarnings("unchecked")
	    List<TabularValidationReportRow> tabularReportRows = (List<TabularValidationReportRow>) rowsQuery.execute(repID);

	    mgr.deletePersistentAll(tabularReportRows);
	    mgr.deletePersistent(tabularReport);

	} finally {
	    mgr.close();
	}
    }

	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}
}
