package com.qdacity.test.TextDocumentEndpointTest;

import static org.junit.Assert.fail;

import java.util.ArrayList;
import java.util.Collection;

import com.google.api.server.spi.response.CollectionResponse;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.datastore.Text;
import com.qdacity.endpoint.TextDocumentEndpoint;
import com.qdacity.project.data.TextDocument;

public class TextDocumentEndpointTestHelper {
	static public void addTextDocument(long projectID, String textString, String title, com.google.appengine.api.users.User loggedInUser) {
		TextDocument doc = new TextDocument();
		doc.setProjectID(projectID);
		doc.setTitle(title);

		Text text = new Text(textString);
		doc.setText(text);

		TextDocumentEndpoint tde = new TextDocumentEndpoint();
		try {
			tde.insertTextDocument(doc, loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for text document creation");
		}
	}

	static public Collection<TextDocument> getTextDocuments(long projectID, String projectType, com.google.appengine.api.users.User loggedInUser) {
		TextDocumentEndpoint tde = new TextDocumentEndpoint();
		try {
			CollectionResponse<TextDocument> docs = tde.getTextDocument(1L, projectType, loggedInUser);
			return docs.getItems();
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for retrieving documents for project");
		}

		return new ArrayList<TextDocument>();
	}

}