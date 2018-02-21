package com.qdacity.endpoint;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.annotation.Nullable;
import javax.inject.Named;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.taskqueue.Queue;
import com.google.appengine.api.taskqueue.QueueFactory;
import com.google.api.server.spi.auth.common.User;
import com.qdacity.Constants;
import com.qdacity.PMF;
import com.qdacity.authentication.QdacityAuthenticator;
import com.qdacity.project.ValidationProject;
import com.qdacity.project.metrics.DocumentResult;
import com.qdacity.project.metrics.ValidationReport;
import com.qdacity.project.metrics.ValidationResult;
import com.qdacity.project.metrics.tasks.DeferredEmailNotification;
import com.qdacity.project.metrics.tasks.DeferredEvaluation;
import com.qdacity.project.metrics.tasks.DeferredEvaluationValidationReport;
import com.qdacity.project.metrics.tasks.DeferredReportDeletion;


@Api(
	name = "qdacity",
	version = Constants.VERSION,
	namespace = @ApiNamespace(
		ownerDomain = "qdacity.com",
		ownerName = "qdacity.com",
		packagePath = "server.project"),
	authenticators = {QdacityAuthenticator.class})
public class ValidationEndpoint {

	@SuppressWarnings("unchecked")
	@ApiMethod(name = "validation.listReports")
	public List<ValidationReport> listReports(@Named("projectID") Long prjID, User user) throws UnauthorizedException {
		List<ValidationReport> reports = new ArrayList<>();
		PersistenceManager mgr = getPersistenceManager();
		try {
			Query q;
			q = mgr.newQuery(ValidationReport.class, " projectID  == :projectID");

			Map<String, Long> params = new HashMap<>();
			params.put("projectID", prjID);

			reports = (List<ValidationReport>) q.executeWithMap(params);

			if(reports != null) {
			    for (ValidationReport validationReport : reports) {
				    List<DocumentResult> docresults = validationReport.getDocumentResults();
					try {
						if (docresults != null) for (DocumentResult documentResult : docresults)
							documentResult.getReportRow();
					} catch (NullPointerException e) {
						// should not happen, but if data (old data) for docresults is corrupt, we still want the reports
						Logger.getLogger("logger").log(Level.WARNING, "docresults not null, but could not iterate through list");
					}
			    }
			}
		} finally {
			mgr.close();
		}
		return reports;
	}

	@SuppressWarnings("unchecked")
	@ApiMethod(name = "validation.listValidationResults")
	public List<ValidationResult> listValidationResults(@Named("reportID") Long reportID, User user) throws UnauthorizedException {
		PersistenceManager mgr = getPersistenceManager();
		List<ValidationResult> results = new ArrayList<ValidationResult>();
		mgr.setIgnoreCache(true); // TODO should probably only be set during generation of new reports, but if not set the report generation can run into an infinite loop
		try {
			Query q = mgr.newQuery(ValidationResult.class, "reportID  == :reportID");
			Map<String, Long> params = new HashMap<String, Long>();
			params.put("reportID", reportID);

			results = (List<ValidationResult>) q.execute(reportID);

		} finally {
			mgr.close();
		}
		return results;
	}

	@SuppressWarnings("unchecked")
	@ApiMethod(name = "validation.listDocumentResults")
	public List<DocumentResult> listDocumentResults(@Named("validationRresultID") Long validationRresultID, User user) throws UnauthorizedException {
		PersistenceManager mgr = getPersistenceManager();
		List<DocumentResult> results = new ArrayList<DocumentResult>();

		try {

			Query q = mgr.newQuery(DocumentResult.class, "validationResultID  == :validationResultID");
			Map<String, Long> params = new HashMap<String, Long>();
			params.put("validationResultID", validationRresultID);

			results = (List<DocumentResult>) q.execute(validationRresultID);


		} finally {
			mgr.close();
		}
		return results;
	}

	@SuppressWarnings("unchecked")
	@ApiMethod(name = "validation.getValidationResult")
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

	@ApiMethod(name = "validation.evaluateRevision")
	public List<ValidationProject> evaluateRevision(@Named("revisionID") Long revisionID, @Named("name") String name, @Named("docs") String docIDsString, @Named("method") String evaluationMethod, @Named("unit") String unitOfCoding, @Named("raterIds")  @Nullable String raterIds, User user) throws UnauthorizedException {

		DeferredEvaluation task = new DeferredEvaluationValidationReport(revisionID, name, docIDsString, evaluationMethod, unitOfCoding, raterIds, user);
		// Set instance variables etc as you wish
		Queue queue = QueueFactory.getDefaultQueue();
		queue.add(com.google.appengine.api.taskqueue.TaskOptions.Builder.withPayload(task));

		return null;
	}

	@ApiMethod(name = "validation.sendNotificationEmail")
	public void sendNotificationEmail(@Named("reportID") Long reportID, User user) throws UnauthorizedException {

		DeferredEmailNotification task = new DeferredEmailNotification(reportID, user);
		// Set instance variables etc as you wish
		Queue queue = QueueFactory.getDefaultQueue();
		queue.add(com.google.appengine.api.taskqueue.TaskOptions.Builder.withPayload(task));
	}

	@SuppressWarnings("unchecked")
	@ApiMethod(name = "validation.deleteReport")
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
			}

			// Delete the actual report
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
