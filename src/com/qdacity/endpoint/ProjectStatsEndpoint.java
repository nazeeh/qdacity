package com.qdacity.endpoint;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.inject.Named;
import javax.jdo.PersistenceManager;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import com.google.api.server.spi.auth.common.User;
import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query.CompositeFilter;
import com.google.appengine.api.datastore.Query.CompositeFilterOperator;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.api.datastore.Text;
import com.qdacity.Constants;
import com.qdacity.PMF;
import com.qdacity.authentication.QdacityAuthenticator;
import com.qdacity.project.ValidationProject;
import com.qdacity.project.metrics.ProjectStats;

@Api(
	name = "qdacity",
	version = Constants.VERSION,
	namespace = @ApiNamespace(
		ownerDomain = "qdacity.com",
		ownerName = "qdacity.com",
		packagePath = "server.project"),
	authenticators = {QdacityAuthenticator.class})
public class ProjectStatsEndpoint {

	/**
	 * This method gets the entity having primary key id. It uses HTTP GET method.
	 *
	 * @param projectId the primary key of the java bean.
	 * @return The entity with primary key id.
	 * @throws UnauthorizedException
	 */
	@ApiMethod(name = "project.getProjectStats")
	public ProjectStats getProjectStats(@Named("id") Long projectId, @Named("projectType") String prjType, User user) throws UnauthorizedException {
		// FIXME authorization for mutliple types of projects
		// Authorization.checkAuthorization(projectId, user);

		ProjectStats projectstats = new ProjectStats();

		// Count and get all TextDocuments
		Filter projectFilter = new FilterPredicate("projectID", FilterOperator.EQUAL, projectId);
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		com.google.appengine.api.datastore.Query q = new com.google.appengine.api.datastore.Query("TextDocument").setFilter(projectFilter);
		PreparedQuery pq = datastore.prepare(q);

		int documentCount = 0;
		int codingCount = 0;
		for (Entity result : pq.asIterable()) {
			documentCount++;

			Text text = (Text) result.getProperty("text");
			String textString = text.getValue();
			codingCount += countCodings(textString);

		}

		// Get the code system id
		projectFilter = new FilterPredicate("project", FilterOperator.EQUAL, projectId);
		String codesystemProjectType = prjType;
		Long codesystemProject = projectId;
		Logger.getLogger("logger").log(Level.INFO, "type: " + prjType);
		if (prjType.equals("VALIDATION")) {
			codesystemProjectType = "REVISION"; // Validationprojects all use the same codesystem belonging to the revision
			PersistenceManager mgr = getPersistenceManager();
			try {
				ValidationProject validationProject = mgr.getObjectById(ValidationProject.class, projectId);
				codesystemProject = validationProject.getRevisionID();
			} finally {
				mgr.close();
			}
			Logger.getLogger("logger").log(Level.INFO, "VALITATION_PROJECT codesystemProject: " + codesystemProject + " codesystemProjectType: " + codesystemProjectType);
		}
		Filter codesystemProjectFilter = new FilterPredicate("project", FilterOperator.EQUAL, codesystemProject);
		Filter projectTypeFilter = new FilterPredicate("projectType", FilterOperator.EQUAL, codesystemProjectType);
		Filter compositeFilter = new CompositeFilter(CompositeFilterOperator.AND, Arrays.asList(codesystemProjectFilter, projectTypeFilter));

		q = new com.google.appengine.api.datastore.Query("CodeSystem").setFilter(compositeFilter);

		pq = datastore.prepare(q);
		Entity entity = pq.asSingleEntity();
		Key entityKey = entity.getKey();
		Long codeSystemID = entityKey.getId();

		// Count the number of codes with this code system id
		projectFilter = new FilterPredicate("codesystemID", FilterOperator.EQUAL, codeSystemID);
		q = new com.google.appengine.api.datastore.Query("Code").setFilter(projectFilter);
		pq = datastore.prepare(q);

		int codeCount = pq.countEntities(FetchOptions.Builder.withOffset(0));

		projectstats.setDocumentCount(documentCount);
		projectstats.setCodeCount(codeCount);
		projectstats.setCodingCount(codingCount);
		projectstats.setSaturation(new SaturationEndpoint().getLatestSaturation(projectId, user));

		return projectstats;
	}

	private int countCodings(String html) {
		try {
			int codingCount = 0;

			Document doc = Jsoup.parse(html);
			Elements codings = doc.getElementsByTag("coding");
			List<String> idsFound = new ArrayList<String>();
			for (Element coding : codings) {
				if (!idsFound.contains(coding.attr("id"))) {
					codingCount++;
					idsFound.add(coding.attr("id"));
				}
			}
			return codingCount;

		} catch (Exception e) {
			Logger.getLogger("logger").log(Level.WARNING, e.getMessage());
		}
		return 0;
	}

	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}

}
