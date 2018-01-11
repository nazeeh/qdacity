package com.qdacity.test.CodeEndpoint;

import static org.junit.Assert.fail;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.jdo.PersistenceManager;
import javax.jdo.Query;

import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query.CompositeFilter;
import com.google.appengine.api.datastore.Query.CompositeFilterOperator;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.qdacity.PMF;
import com.qdacity.endpoint.CodeEndpoint;
import com.qdacity.project.codesystem.Code;

public class CodeEndpointTestHelper {
	static public void addCode(Long id, Long codeID, Long parentID, Long codesystemID, String authorName, String color, com.google.appengine.api.users.User loggedInUser) {
		try {

			DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
			Filter codeIdFilter = new FilterPredicate("codeID", FilterOperator.EQUAL, parentID);
			Filter codeSystemFilter = new FilterPredicate("codesystemID", FilterOperator.EQUAL, codesystemID);
			Filter filter = new CompositeFilter(CompositeFilterOperator.AND, Arrays.asList(codeIdFilter, codeSystemFilter));

			com.google.appengine.api.datastore.Query q = new com.google.appengine.api.datastore.Query("Code").setFilter(filter);

			PreparedQuery pq = datastore.prepare(q);

			Long parentDbId = pq.asSingleEntity().getKey().getId();

			updateParentsSubCodeIds(parentID, codesystemID, codeID);
			Code code = new Code();
			code.setId(id);
			code.setAuthor(authorName);
			code.setCodeID(codeID);
			code.setParentID(parentID);
			code.setCodesystemID(codesystemID);
			code.setColor(color);
			CodeEndpoint ce = new CodeEndpoint();
			ce.insertCode(null, null, parentDbId, code, loggedInUser);


		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for code creation");
		}
	}


	static private void updateParentsSubCodeIds(Long parentID, Long codeSystemId, Long subCodeId) {
		PersistenceManager mgr = getPersistenceManager();

		Query query = mgr.newQuery(Code.class);

		try {

		// Actual Delete
		query.setFilter("codeID == :code && codesystemID == :codesystem");
		Map<String, Long> params = new HashMap<String, Long>();
		params.put("code", parentID);
		params.put("codesystem", codeSystemId);

		@SuppressWarnings("unchecked")
		List<Code> codes = (List<Code>) query.executeWithMap(params);

		Code code = codes.get(0);
		code.addSubCodeID(subCodeId);
		mgr.makePersistent(code);
		} finally {
			mgr.close();
		}
	}

	static public void removeCode(Long id, com.google.appengine.api.users.User loggedInUser) {
		try {
			CodeEndpoint ce = new CodeEndpoint();
			ce.removeCode(id, loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for code creation");
		}
	}

	static public Code getCode(Long id, com.google.appengine.api.users.User loggedInUser) {
		try {
			CodeEndpoint ce = new CodeEndpoint();

			return ce.getCode(id, loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for code creation");
		}
		return null;
	}

	static public void updateCode(Code code, com.google.appengine.api.users.User loggedInUser) {
		try {
			CodeEndpoint ce = new CodeEndpoint();
			ce.updateCode(code, loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for code creation");
		}
	}

	static public void relocateCode(Long codeID, Long newParentID, com.google.appengine.api.users.User loggedInUser) {
		try {
			CodeEndpoint ce = new CodeEndpoint();
			ce.relocateCode(codeID, newParentID, loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for code creation");
		}
	}

	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}
}
