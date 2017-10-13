package com.qdacity.test.TextDocumentEndpointTest;

import static org.junit.Assert.fail;

import java.util.ArrayList;
import java.util.Collection;

import com.google.api.server.spi.response.CollectionResponse;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.datastore.Text;
import com.google.appengine.api.users.User;
import com.qdacity.endpoint.TextDocumentEndpoint;
import com.qdacity.project.data.TextDocument;

public class TextDocumentEndpointTestHelper {
	static public TextDocument addTextDocument(long projectID, String textString, String title, com.google.appengine.api.users.User loggedInUser) {
		TextDocument doc = new TextDocument();
		doc.setProjectID(projectID);
		doc.setTitle(title);

		Text text = new Text(textString);
		doc.setText(text);

		TextDocumentEndpoint tde = new TextDocumentEndpoint();
		try {
			return tde.insertTextDocument(doc, loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for text document creation");
		}
		return null;
	}

	static public void updateTextDocument(TextDocument doc, com.google.appengine.api.users.User loggedInUser) {
		TextDocumentEndpoint tde = new TextDocumentEndpoint();
		try {
			tde.updateTextDocument(doc, loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for text document update");
		}
	}

	static public void removeTextDocument(Long docId, User loggedInUser) {

		TextDocumentEndpoint tde = new TextDocumentEndpoint();
		try {
			tde.removeTextDocument(docId, loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for text document creation");
		}
	}

	static public Collection<TextDocument> getTextDocuments(long projectID, String projectType, com.google.appengine.api.users.User loggedInUser) {
		TextDocumentEndpoint tde = new TextDocumentEndpoint();
		try {
			CollectionResponse<TextDocument> docs = tde.getTextDocument(projectID, projectType, loggedInUser);
			return docs.getItems();
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for retrieving documents for project");
		}

		return new ArrayList<TextDocument>();
	}

}
