package com.qdacity.project.metrics.tasks;

import java.text.DateFormat;
import java.text.Normalizer;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.jdo.PersistenceManager;
import javax.jdo.Query;

import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.taskqueue.DeferredTask;
import com.google.appengine.api.users.User;
import com.google.appengine.labs.repackaged.org.json.JSONException;
import com.qdacity.Credentials;
import com.qdacity.PMF;
import com.qdacity.Sendgrid;
import com.qdacity.project.ValidationProject;
import com.qdacity.project.metrics.DocumentResult;
import com.qdacity.project.metrics.ValidationEndpoint;
import com.qdacity.project.metrics.ValidationReport;
import com.qdacity.project.metrics.ValidationResult;

public class DeferredEmailNotification implements DeferredTask {

	/**
	 * 
	 */
	private static final long serialVersionUID = -3127551088307071416L;
	Long reportID;
	User user;

	public DeferredEmailNotification(Long reportID, User user) {
		super();
		this.reportID = reportID;
	}

	@SuppressWarnings("unchecked")
	@Override
	public void run() {
		PersistenceManager mgr = getPersistenceManager();

		try {
			ValidationReport report = mgr.getObjectById(ValidationReport.class, reportID);
			// FIXME
			List<ValidationResult> results;

			Query q2 = mgr.newQuery(ValidationResult.class, "reportID  == :reportID");

			results = (List<ValidationResult>) q2.execute(reportID);

			ValidationEndpoint ve = new ValidationEndpoint();

			for (ValidationResult result : results) {
				Sendgrid mail = new Sendgrid(Credentials.SENDGRID_USER, Credentials.SENDGRID_PW);
				Long prjID = result.getValidationProjectID();
				ValidationProject project = mgr.getObjectById(ValidationProject.class, prjID);
				List<String> coderIDs = project.getValidationCoders();
				String greetingName = "";
				for (String coderID : coderIDs) {
					com.qdacity.user.User coder = mgr.getObjectById(com.qdacity.user.User.class, coderID);
					String name = Normalizer.normalize(coder.getGivenName(), Normalizer.Form.NFKD).replaceAll("[^\\p{ASCII}]", "") + " " + Normalizer.normalize(coder.getSurName(), Normalizer.Form.NFKD).replaceAll("[^\\p{ASCII}]", "");
					Logger.getLogger("logger").log(Level.INFO, "Sending notification mail to: " + name);
					mail.addTo(coder.getEmail(), name);
					greetingName += coder.getGivenName() + ", ";
				}
				mail.addTo("kaufmann@group.riehle.org", "Andreas Kaufmann");
				String msgBody = "Hi " + greetingName + "<br>";
				msgBody += "<p>";
				msgBody += "We have analyzed your codings, and you've achieved the following scores:<br>";
				msgBody += "</p>";
				msgBody += "<p>";
				msgBody += "<strong>Overall</strong> <br>";
				msgBody += "F-Measure: " + result.getParagraphAgreement().getFMeasure() + "<br>";
				msgBody += "Recall: " + result.getParagraphAgreement().getRecall() + "<br>";
				msgBody += "Precision: " + result.getParagraphAgreement().getPrecision() + "<br>";
				msgBody += "</p>";
				msgBody += "<p>";
				msgBody += "<strong>Document specific data:</strong><br>";
				msgBody += "</p>";

				List<DocumentResult> docResults = ve.listDocumentResults(result.getId(), user);
				for (DocumentResult documentResult : docResults) {
					msgBody += "<p>";
					msgBody += "<strong>" + documentResult.getDocumentName() + ":</strong><br>";
					msgBody += "F-Measure: " + documentResult.getParagraphAgreement().getFMeasure() + "<br>";
					msgBody += "Recall: " + documentResult.getParagraphAgreement().getRecall() + "<br>";
					msgBody += "Precision: " + documentResult.getParagraphAgreement().getPrecision() + "<br><br>";
					msgBody += "</p>";
				}

				msgBody += "<p>";
				msgBody += "You may compare these values to the average of this report<br>";
				msgBody += "F-Measure: " + report.getParagraphAgreement().getFMeasure() + "<br>";
				msgBody += "Recall: " + report.getParagraphAgreement().getRecall() + "<br>";
				msgBody += "Precision: " + report.getParagraphAgreement().getPrecision() + "<br><br>";
				msgBody += "</p>";

				msgBody += "<p>";
				msgBody += "This email is generated for this report: " + report.getName() + "<br>";
				String reportTime = DateFormat.getDateInstance().format(report.getDatetime());

				msgBody += "Date of this report: " + reportTime + "<br>";

				msgBody += "<p>";
				msgBody += "Best regards,<br>";
				msgBody += "QDAcity Mailbot<br>";
				msgBody += "</p>";

				mail.setFrom("QDAcity <support@qdacity.com>");
				mail.setSubject("QDAcity Report");
				mail.setText(" ").setHtml(msgBody);

				mail.send();

				Logger.getLogger("logger").log(Level.INFO, mail.getServerResponse());

			}
		} catch (UnauthorizedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (JSONException e) {
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