package com.qdacity.endpoint;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Nullable;
import javax.inject.Named;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import javax.persistence.EntityExistsException;
import javax.persistence.EntityNotFoundException;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;

import com.google.api.server.spi.auth.common.User;
import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.response.CollectionResponse;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.datastore.Cursor;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Text;
import com.google.appengine.api.memcache.Expiration;
import com.google.appengine.api.memcache.MemcacheService;
import com.google.appengine.api.memcache.MemcacheServiceFactory;
import com.google.appengine.datanucleus.query.JDOCursorHelper;
import com.qdacity.Authorization;
import com.qdacity.Constants;
import com.qdacity.PMF;
import com.qdacity.endpoint.datastructures.TextDocumentCodeContainer;
import com.qdacity.logs.Change;
import com.qdacity.logs.ChangeBuilder;
import com.qdacity.logs.ChangeLogger;
import com.qdacity.project.AbstractProject;
import com.qdacity.project.ProjectRevision;
import com.qdacity.project.ValidationProject;
import com.qdacity.project.codesystem.CodeSystem;
import com.qdacity.project.data.AgreementMap;
import com.qdacity.project.data.TextDocument;
import com.qdacity.project.metrics.DocumentResult;
import com.qdacity.project.metrics.ValidationReport;
import com.qdacity.util.DataStoreUtil;

@Api(
	name = "qdacity",
	version = Constants.VERSION,
	namespace = @ApiNamespace(
		ownerDomain = "qdacity.com",
		ownerName = "qdacity.com",
		packagePath = "server.project"),
	authenticators = {FirebaseAuthenticator.class})
public class TextDocumentEndpoint {

	/**
	 * This method lists all the entities inserted in datastore.
	 * It uses HTTP GET method and paging support.
	 *
	 * @return A CollectionResponse class containing the list of all entities
	 *         persisted and a cursor to the next page.
	 * @throws UnauthorizedException
	 */
	@ApiMethod(name = "documents.listTextDocument")
	public CollectionResponse<TextDocument> listTextDocument(@Nullable @Named("cursor") String cursorString, @Nullable @Named("limit") Integer limit, User user) throws UnauthorizedException {

		throw new UnauthorizedException("User not authorized"); // TODO currently no user is authorized to list all text documents

	}

	/**
	 * This method gets the entity having primary key id. It uses HTTP GET method.
	 *
	 * @param id the primary key of the java bean.
	 * @return The entity with primary key id.
	 * @throws UnauthorizedException
	 */
	@SuppressWarnings("unchecked")
	@ApiMethod(name = "documents.getTextDocument")
	public CollectionResponse<TextDocument> getTextDocument(@Named("id") Long id, @Nullable @Named("projectType") String prjType, User user) throws UnauthorizedException {

		PersistenceManager mgr = null;
		Cursor cursor = null;
		List<TextDocument> execute = null;
		String cursorString = null;

		try {
			mgr = getPersistenceManager();
			mgr.setMultithreaded(true);
			// Check authorization
			if (prjType.equals("REVISION")) {
				ProjectRevision validationProject = mgr.getObjectById(ProjectRevision.class, id);
				Authorization.checkAuthorization(validationProject.getProjectID(), user);
			} else if (prjType != null && prjType.equals("VALIDATION")) {
				// FIXME auth
			} else {
				Authorization.checkAuthorization(id, user);
			}

			Query query = mgr.newQuery(TextDocument.class);

			query.setFilter("projectID == :theID");
			Map<String, Long> paramValues = new HashMap<String, Long>();
			paramValues.put("theID", id);

			execute = (List<TextDocument>) query.executeWithMap(paramValues);

			cursor = JDOCursorHelper.getCursor(execute);
			if (cursor != null) cursorString = cursor.toWebSafeString();

			for (TextDocument obj : execute);
		} finally {
			mgr.close();
		}
		return CollectionResponse.<TextDocument> builder().setItems(execute).setNextPageToken(cursorString).build();
	}

	@ApiMethod(name = "documents.getAgreementMaps")
	public List<AgreementMap> getAgreementMaps(@Named("id") Long id, @Named("projectType") String projectType, User user) throws UnauthorizedException {

		PersistenceManager mgr = null;
		List<AgreementMap> agreementMaps = new ArrayList<AgreementMap>();

		try {
			mgr = getPersistenceManager();

			List<DocumentResult> documentResults = new ArrayList<DocumentResult>();

			if (projectType.equals("REVISION")) {
				ValidationReport report = mgr.getObjectById(ValidationReport.class, id);
				documentResults = report.getDocumentResults();
			} else if (projectType.equals("VALIDATION")) {
				ValidationEndpoint ve = new ValidationEndpoint();
				documentResults = ve.listDocumentResults(id, user);
			}
			if (documentResults.size() > 0) {
				for (DocumentResult documentResult : documentResults) {
					if (documentResult.getAgreementMap() != null) agreementMaps.add(documentResult.getAgreementMap());
				}
			}


		} finally {
			mgr.close();
		}
		return agreementMaps;
	}


	/**
	 * This inserts a new entity into App Engine datastore. If the entity already
	 * exists in the datastore, an exception is thrown.
	 * It uses HTTP POST method.
	 *
	 * @param textdocument the entity to be inserted.
	 * @return The inserted entity.
	 * @throws UnauthorizedException
	 */
	@ApiMethod(name = "documents.insertTextDocument")
	public TextDocument insertTextDocument(TextDocument textdocument, User user) throws UnauthorizedException {
		// Check authorization
		Authorization.checkAuthorization(textdocument, user);

		PersistenceManager mgr = getPersistenceManager();
		try {
			if (textdocument.getId() != null && containsTextDocument(textdocument)) {
				throw new EntityExistsException("Object already exists");
			}
			mgr.makePersistent(textdocument);
			
			//Log Change
			Change change = new ChangeBuilder().makeInsertTextDocumentChange(textdocument, textdocument.getProjectID(), user.getId());
			ChangeLogger.logChange(change);
			
		} finally {
			mgr.close();
		}
		return textdocument;
	}

	/**
	 * This method is used for updating an existing entity. If the entity does not
	 * exist in the datastore, an exception is thrown.
	 * It uses HTTP PUT method.
	 *
	 * @param textdocument the entity to be updated.
	 * @return The updated entity.
	 * @throws UnauthorizedException
	 */
	@ApiMethod(name = "documents.updateTextDocument")
	public TextDocument updateTextDocument(TextDocument textdocument, User user) throws UnauthorizedException {
		// Check authorization
		// Authorization.checkAuthorization(textdocument, user); // FIXME authorization for textdocument w.r.t. project type

		PersistenceManager mgr = getPersistenceManager();
		try {
			if (!containsTextDocument(textdocument)) {
				throw new EntityNotFoundException("Object does not exist");
			}
			mgr.makePersistent(textdocument);
		} finally {
			mgr.close();
		}
		return textdocument;
	}
	
	/**
	 * This method is used for applying a code to a TextDocument. If the entity does not
	 * exist in the datastore, an exception is thrown.
	 * It uses HTTP PUT method.
	 *
	 * @param textDocumentCode the textdocument and the code in a container 
	 * @param user
	 * @return The updated entity.
	 * @throws UnauthorizedException
	 */
	@ApiMethod(name = "documents.applyCode")
	public TextDocument applyCode(TextDocumentCodeContainer textDocumentCode, User user) throws UnauthorizedException {
		PersistenceManager mgr = getPersistenceManager();
		try {
			if (!containsTextDocument(textDocumentCode.textDocument)) {
				throw new EntityNotFoundException("Object does not exist");
			}
			mgr.makePersistent(textDocumentCode.textDocument);
			
			CodeSystem cs = mgr.getObjectById(CodeSystem.class, textDocumentCode.code.getCodesystemID());
			Change change = new ChangeBuilder().makeApplyCodeChange(textDocumentCode.textDocument, textDocumentCode.code, user, cs.getProjectType());
			ChangeLogger.logChange(change);
		} finally {
			mgr.close();
		}
		return textDocumentCode.textDocument;
	}

	/**
	 * This method removes the entity with primary key id.
	 * It uses HTTP DELETE method.
	 *
	 * @param id the primary key of the entity to be deleted.
	 * @throws UnauthorizedException
	 */
	@ApiMethod(name = "documents.removeTextDocument")
	public void removeTextDocument(@Named("id") Long id, User user) throws UnauthorizedException {
		PersistenceManager mgr = getPersistenceManager();
		try {
			TextDocument textdocument = mgr.getObjectById(TextDocument.class, id);
			// Check authorization
			Authorization.checkAuthorization(textdocument, user);

			mgr.deletePersistent(textdocument);
		} finally {
			mgr.close();
		}
	}

	public static void cloneTextDocuments(AbstractProject project, Long cloneId, Boolean stripCodings, User user) throws UnauthorizedException {
		TextDocumentEndpoint tde = new TextDocumentEndpoint();
		Collection<TextDocument> documents = null;
		if (project.getClass() == ProjectRevision.class) documents = tde.getTextDocument(project.getId(), "REVISION", user).getItems();
		else documents = tde.getTextDocument(project.getId(), "PROJECT", user).getItems();

		PersistenceManager mgr = getPersistenceManager();
		try {
			for (TextDocument textDocument : documents) {
				Text text = textDocument.getText();
				if (stripCodings) {
					Document doc = Jsoup.parse(text.getValue());
					doc.select("coding").unwrap();
					text = new Text(doc.body().children().toString()); // Jsoup wraps the elements in html and body tags if not present, so we have to get body's children here to get the converted fragment.
				}
				TextDocument cloneDocument = new TextDocument();
				cloneDocument.setProjectID(cloneId);
				cloneDocument.setTitle(textDocument.getTitle());
				cloneDocument.setText(text);

				mgr.makePersistent(cloneDocument);
			}
		} finally {
			mgr.close();
		}

	}

	private boolean containsTextDocument(TextDocument textdocument) {
		PersistenceManager mgr = getPersistenceManager();
		boolean contains = true;
		try {
			mgr.getObjectById(TextDocument.class, textdocument.getId());
		} catch (javax.jdo.JDOObjectNotFoundException ex) {
			contains = false;
		} finally {
			mgr.close();
		}
		return contains;
	}

	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}
	
	/**
	 * For usage with Krippendorffs Alpha or Fleiss Kappa. Automatically puts the documents to Memcache!
	 * @param validationProjects from which validation projects to get the documents from
	 * @param docIDs filter for documents from the main project (will filter by title of the documents)
	 * @param user with sufficient rights to get the documents
	 * @return a HashMap grouped by Document name containig a list with the corresponding document Ids from the different users
	 * @throws UnauthorizedException 
	 */
	public static Map<String, ArrayList<Long>> getDocumentsFromDifferentValidationProjectsGroupedByName(List<ValidationProject> validationProjects, List<Long> docIDs, User user) throws UnauthorizedException {
	    	TextDocumentEndpoint tde = new TextDocumentEndpoint();
		Map<String, ArrayList<Long>> sameDocumentsFromDifferentRaters = new HashMap();
		
		List<String> docTitles = getDocumentTitles(docIDs); //We need the names to filter for the actually wanted documents in this report.
		//Not possible to filter by IDs as the IDs of the documents of the different rates are different!
		for (ValidationProject project : validationProjects) {
		    //gets the documents from the validationProject of a user with the rights of our user.
		    Collection<TextDocument> textDocuments = tde.getTextDocument(project.getId(), "VALIDATION", user).getItems();
		    for(TextDocument doc : textDocuments) {
			if(docTitles.contains(doc.getTitle())) {
			    if(null == sameDocumentsFromDifferentRaters.get(doc.getTitle())) {
				sameDocumentsFromDifferentRaters.put(doc.getTitle(), new ArrayList<Long>());
			    }
			    sameDocumentsFromDifferentRaters.get(doc.getTitle()).add(doc.getId());
			}
			putTextDocumentToMemcache(doc);
		    }
		}
		return sameDocumentsFromDifferentRaters;
	}
	
	/**
	 * Put a TextDocument to the Memcache to read it faster/cheaper later (within 300 seconds)
	 * Hint: Not guarantee it is actually put to memcache!
	 * @param tx the textdocument
	 */
	public static void putTextDocumentToMemcache(TextDocument tx) {
	    String keyString = KeyFactory.createKeyString(TextDocument.class.toString(), tx.getId());
	    MemcacheService syncCache = MemcacheServiceFactory.getMemcacheService();
	    syncCache.put(keyString, tx, Expiration.byDeltaSeconds(300));
	}
	
	/**
	 * Get the textdocuments from memcache or load them from database. Use this method after putTextDocumentToMemcache
	 * @param textDocumentIds all the documents you want to collect
	 * @return 
	 */
	public static List<TextDocument> collectTextDocumentsfromMemcache(List<Long> textDocumentIds) {
	    PersistenceManager mgr = getPersistenceManager();
	    List<TextDocument> textDocuments = new ArrayList<>();
		try {
			for (Long docID : textDocumentIds) { // Get Textdocuments from Memcache
				String keyString = KeyFactory.createKeyString(TextDocument.class.toString(), docID);
				MemcacheService syncCache = MemcacheServiceFactory.getMemcacheService();
				syncCache.get(keyString);
				TextDocument origialDoc = (TextDocument) syncCache.get(keyString);
				if (origialDoc == null) {
					origialDoc = mgr.getObjectById(TextDocument.class, docID);
				}
				textDocuments.add(origialDoc);
			}
		} finally {
			mgr.close();
		}

	    return textDocuments;
	}
	
	private static List<String> getDocumentTitles(List<Long> docIDs) {
		PersistenceManager mgr = null;
		List<TextDocument> tmpDocs;
		List<String> docNames = new ArrayList<>();

		try {
			mgr = getPersistenceManager();
			mgr.setMultithreaded(true);
			for(Long id : docIDs) {
			    Query query = mgr.newQuery(TextDocument.class);

			    query.setFilter("id == :theID");
			    Map<String, Long> paramValues = new HashMap<>();
			    paramValues.put("theID", id);

			    tmpDocs = (List<TextDocument>) query.executeWithMap(paramValues);

			    for (TextDocument doc : tmpDocs) {
				docNames.add(doc.getTitle());
			    }
			}
		} finally {
			mgr.close();
		}
		return docNames;
	}
	
    public static int countDocuments(Long projectId) {
	Filter filter = new com.google.appengine.api.datastore.Query.FilterPredicate("projectID", com.google.appengine.api.datastore.Query.FilterOperator.EQUAL, projectId);
	return DataStoreUtil.countEntitiesWithFilter("TextDocument", filter);
    }

}
