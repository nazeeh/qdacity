package com.qdacity.project;

import com.qdacity.Authorization;
import com.qdacity.Constants;
import com.qdacity.PMF;
import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.response.CollectionResponse;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.datastore.Cursor;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.api.datastore.Text;
import com.google.appengine.api.users.User;
import com.google.appengine.datanucleus.query.JDOCursorHelper;











import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.annotation.Nullable;
import javax.inject.Named;
import javax.persistence.EntityExistsException;
import javax.persistence.EntityNotFoundException;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

@Api(name = "qdacity", namespace = @ApiNamespace(ownerDomain = "qdacity.com", ownerName = "qdacity.com", packagePath = "server.project"))
public class ProjectStatsEndpoint {


	/**
	 * This method gets the entity having primary key id. It uses HTTP GET method.
	 *
	 * @param projectId the primary key of the java bean.
	 * @return The entity with primary key id.
	 * @throws UnauthorizedException 
	 */
	@ApiMethod(name = "project.getProjectStats",  scopes = {Constants.EMAIL_SCOPE},
	clientIds = {Constants.WEB_CLIENT_ID, 
     com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
     audiences = {Constants.WEB_CLIENT_ID})
	public ProjectStats getProjectStats(@Named("id") Long projectId, @Named("projectType") String prjType, User user) throws UnauthorizedException {
		
		Authorization.checkAuthorization(projectId, user);
		
		ProjectStats projectstats = new ProjectStats();
		
		// Count and get all TextDocuments
		Filter projectFilter = new FilterPredicate("projectID", FilterOperator.EQUAL, projectId);
		//Filter projectFilter = new FilterPredicate("projectType", FilterOperator.EQUAL, projectId);
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		com.google.appengine.api.datastore.Query q = new com.google.appengine.api.datastore.Query("TextDocument").setFilter(projectFilter);
		PreparedQuery pq = datastore.prepare(q);
		
		//int documentCount = pq.countEntities(FetchOptions.Builder.withOffset(0));
		int documentCount = 0;
		int codingCount = 0;
		for (Entity result : pq.asIterable()) {
			documentCount++;
			
			Text text = (Text) result.getProperty("text");
			String textString = text.getValue();
			codingCount += countElementsInXML(textString);
			
		}
	
		// Get the code system id
		projectFilter = new FilterPredicate("project", FilterOperator.EQUAL, projectId);
		Filter projectTypeFilter = new FilterPredicate("projectType", FilterOperator.EQUAL, prjType);
		q = new com.google.appengine.api.datastore.Query("CodeSystem").setFilter(projectFilter).setFilter(projectTypeFilter);
		
		pq = datastore.prepare(q);
		Entity entity =  pq.asSingleEntity();
		Key entityKey =   entity.getKey();
		Long codeSystemID = entityKey.getId();

		// Count the number of codes with this code system id
		projectFilter = new FilterPredicate("codesytemID", FilterOperator.EQUAL, codeSystemID);
		q = new com.google.appengine.api.datastore.Query("Code").setFilter(projectFilter);
		pq = datastore.prepare(q);
		
		int codeCount = pq.countEntities(FetchOptions.Builder.withOffset(0));
		
		
		projectstats.setDocumentCount(documentCount);
		projectstats.setCodeCount(codeCount);
		projectstats.setCodingCount(codingCount);
		
		return projectstats;
	}
	
	int countElementsInXML(String html){
		try {
			int codingCount = 0;
			
			Document doc = Jsoup.parse(html);
			Elements codings = doc.getElementsByTag("coding");
			List<String> idsFound = new ArrayList<String>();
			for (Element coding : codings) {
				  if (!idsFound.contains(coding.attr("id"))){
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


}
