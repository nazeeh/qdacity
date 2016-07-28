package com.qdacity.upload;

import com.qdacity.Constants;
import com.qdacity.server.PMF;
import com.qdacity.server.project.TextDocument;
import com.qdacity.server.project.TextDocumentEndpoint;
import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.response.CollectionResponse;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.datastore.Cursor;
import com.google.appengine.api.datastore.Text;
import com.google.appengine.api.users.User;
import com.google.appengine.datanucleus.query.JDOCursorHelper;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.Reader;
import java.io.StringWriter;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;

import javax.annotation.Nullable;
import javax.inject.Named;
import javax.persistence.EntityExistsException;
import javax.persistence.EntityNotFoundException;
import javax.swing.JEditorPane;
import javax.xml.bind.DatatypeConverter;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.sax.SAXTransformerFactory;
import javax.xml.transform.sax.TransformerHandler;
//import javax.xml.transform.sax.TransformerHandler;
import javax.xml.transform.stream.StreamResult;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;

import org.apache.tika.exception.TikaException;
import org.apache.tika.metadata.Metadata;
import org.apache.tika.parser.ParseContext;
import org.apache.tika.parser.rtf.RTFParser;
//import org.apache.tika.metadata.Metadata;
//import org.apache.tika.parser.ParseContext;
//import org.docx4j.Docx4J;
//import org.docx4j.Docx4jProperties;
//import org.docx4j.convert.out.HTMLSettings;
//import org.docx4j.openpackaging.exceptions.Docx4JException;
//import org.docx4j.openpackaging.packages.WordprocessingMLPackage;
import org.xml.sax.SAXException;




@Api(name = "qdacity", namespace = @ApiNamespace(ownerDomain = "qdacity.com", ownerName = "qdacity.com", packagePath = "server.project"))
public class UploadEndpoint {

	/**
	 * This method lists all the entities inserted in datastore.
	 * It uses HTTP GET method and paging support.
	 *
	 * @return A CollectionResponse class containing the list of all entities
	 * persisted and a cursor to the next page.
	 */
	@SuppressWarnings({ "unchecked", "unused" })
	@ApiMethod(name = "listUpload")
	public CollectionResponse<Upload> listUpload(
			@Nullable @Named("cursor") String cursorString,
			@Nullable @Named("limit") Integer limit) {

		PersistenceManager mgr = null;
		Cursor cursor = null;
		List<Upload> execute = null;

		try {
			mgr = getPersistenceManager();
			Query query = mgr.newQuery(Upload.class);
			if (cursorString != null && cursorString != "") {
				cursor = Cursor.fromWebSafeString(cursorString);
				HashMap<String, Object> extensionMap = new HashMap<String, Object>();
				extensionMap.put(JDOCursorHelper.CURSOR_EXTENSION, cursor);
				query.setExtensions(extensionMap);
			}

			if (limit != null) {
				query.setRange(0, limit);
			}

			execute = (List<Upload>) query.execute();
			cursor = JDOCursorHelper.getCursor(execute);
			if (cursor != null)
				cursorString = cursor.toWebSafeString();

			// Tight loop for fetching all entities from datastore and accomodate
			// for lazy fetch.
			for (Upload obj : execute)
				;
		} finally {
			mgr.close();
		}

		return CollectionResponse.<Upload> builder().setItems(execute)
				.setNextPageToken(cursorString).build();
	}

	/**
	 * This method gets the entity having primary key id. It uses HTTP GET method.
	 *
	 * @param id the primary key of the java bean.
	 * @return The entity with primary key id.
	 */
	@ApiMethod(name = "getUpload")
	public Upload getUpload(@Named("id") Long id) {
		PersistenceManager mgr = getPersistenceManager();
		Upload upload = null;
		try {
			upload = mgr.getObjectById(Upload.class, id);
		} finally {
			mgr.close();
		}
		return upload;
	}

	/**
	 * This inserts a new entity into App Engine datastore. If the entity already
	 * exists in the datastore, an exception is thrown.
	 * It uses HTTP POST method.
	 *
	 * @param upload the entity to be inserted.
	 * @return The inserted entity.
	 * @throws UnauthorizedException 
	 */
	@ApiMethod(name = "upload.insertUpload" , path = "upload",  scopes = {Constants.EMAIL_SCOPE},
			clientIds = {Constants.WEB_CLIENT_ID, 
		     com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
		     audiences = {Constants.WEB_CLIENT_ID})
	public TextDocument insertUpload(Upload upload, User user) throws UnauthorizedException {
		//FIXME authorization check
		PersistenceManager mgr = getPersistenceManager();
		TextDocument document = null;
		try {
			if (upload.getId() != null){
				if (containsUpload(upload)) {
					throw new EntityExistsException("Object already exists");
				}
			}
			
			byte[] bytes = upload.fileData.getBytes();
		
			String html = rtfToHtml(bytes);
			
			
			
			document = new TextDocument();
			document.setProjectID(upload.getProject());
			document.setText(new Text(html));
			document.setTitle(upload.getFileName());
			
			TextDocumentEndpoint tde = new TextDocumentEndpoint();
			
			tde.insertTextDocument(document, user);
			
			
			mgr.makePersistent(upload);
		} finally {
			mgr.close();
		}
		return document;
	}

	private String rtfToHtml(byte[] bytes) {
		
		try {
		Metadata metadata = new Metadata();

	    StringWriter sw = new StringWriter();
	    SAXTransformerFactory factory = (SAXTransformerFactory)
	             SAXTransformerFactory.newInstance();
	    TransformerHandler handler;
		
			handler = factory.newTransformerHandler();
		
	    handler.getTransformer().setOutputProperty(OutputKeys.METHOD, "xml");
	    handler.getTransformer().setOutputProperty(OutputKeys.INDENT, "no");
	    handler.setResult(new StreamResult(sw));
	    RTFParser parser = new RTFParser();
	   
	    InputStream is = new ByteArrayInputStream(bytes);
	    // TikaInputStream  tis =  TikaInputStream.get(is);
	    parser.parse(is, handler, metadata, new ParseContext());
//	    
	    String xhtml = sw.toString();
	    xhtml.split("(.*<\\s*body[^>]*>)|(<\\s*/\\s*body\\s*\\>.+)");
	    int start = xhtml.indexOf("<body>") + 6;
	    int end = xhtml.indexOf("</body>");
	    xhtml = xhtml.substring(start, end);
	    return xhtml;
//	    
		} catch (TransformerConfigurationException | IOException | SAXException | TikaException  e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	    return "Error while parsing RTF";
	}
	
//private String rtfToHtml2(byte[] bytes) {
//	InputStream is = new ByteArrayInputStream(bytes);
//	try {
//		WordprocessingMLPackage doc = Docx4J.load(is);
//		
//		HTMLSettings htmlSettings = Docx4J.createHTMLSettings();
//
////    	htmlSettings.setWmlPackage(doc);
////    	String userCSS = "html, body, div, span, h1, h2, h3, h4, h5, h6, p, a, img,  ol, ul, li, table, caption, tbody, tfoot, thead, tr, th, td " +
////    			"{ margin: 0; padding: 0; border: 0;}" +
////    			"body {line-height: 1;} ";
////    	htmlSettings.setUserCSS(userCSS);
//    	
////    	ByteArrayOutputStream os = new ByteArrayOutputStream();
////    	
////    	Docx4jProperties.setProperty("docx4j.Convert.Out.HTML.OutputMethodXML", true);
////    	
////    	Docx4J.toHTML(htmlSettings, os, Docx4J.FLAG_EXPORT_PREFER_XSL);
////    	
////    	return os.toString();
//    	
//    	
//	} catch (Exception e) {
//		// TODO Auto-generated catch block
//		e.printStackTrace();
//	}
//	    return "Error while parsing RTF";
//	}
	


	/**
	 * This method is used for updating an existing entity. If the entity does not
	 * exist in the datastore, an exception is thrown.
	 * It uses HTTP PUT method.
	 *
	 * @param upload the entity to be updated.
	 * @return The updated entity.
	 */
	@ApiMethod(name = "updateUpload")
	public Upload updateUpload(Upload upload) {
		PersistenceManager mgr = getPersistenceManager();
		try {
			if (!containsUpload(upload)) {
				throw new EntityNotFoundException("Object does not exist");
			}
			mgr.makePersistent(upload);
		} finally {
			mgr.close();
		}
		return upload;
	}

	/**
	 * This method removes the entity with primary key id.
	 * It uses HTTP DELETE method.
	 *
	 * @param id the primary key of the entity to be deleted.
	 */
	@ApiMethod(name = "removeUpload")
	public void removeUpload(@Named("id") Long id) {
		PersistenceManager mgr = getPersistenceManager();
		try {
			Upload upload = mgr.getObjectById(Upload.class, id);
			mgr.deletePersistent(upload);
		} finally {
			mgr.close();
		}
	}

	private boolean containsUpload(Upload upload) {
		PersistenceManager mgr = getPersistenceManager();
		boolean contains = true;
		try {
			mgr.getObjectById(Upload.class, upload.getId());
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

}
