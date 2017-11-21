package com.qdacity.endpoint;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.StringWriter;

import javax.jdo.PersistenceManager;
import javax.persistence.EntityExistsException;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.sax.SAXTransformerFactory;
import javax.xml.transform.sax.TransformerHandler;
import javax.xml.transform.stream.StreamResult;

import org.apache.tika.exception.TikaException;
import org.apache.tika.metadata.Metadata;
import org.apache.tika.parser.ParseContext;
import org.apache.tika.parser.rtf.RTFParser;
import org.xml.sax.SAXException;

import com.google.api.server.spi.auth.common.User;
import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.datastore.Text;
import com.qdacity.Constants;
import com.qdacity.PMF;
import com.qdacity.authentication.FirebaseAuthenticator;
import com.qdacity.project.data.TextDocument;
import com.qdacity.upload.Upload;

@Api(
	name = "qdacity",
	version = Constants.VERSION,
	namespace = @ApiNamespace(
		ownerDomain = "qdacity.com",
		ownerName = "qdacity.com",
		packagePath = "server.project"),
	authenticators = {FirebaseAuthenticator.class})
public class UploadEndpoint {

	/**
	 * This inserts a new entity into App Engine datastore. If the entity already
	 * exists in the datastore, an exception is thrown.
	 * It uses HTTP POST method.
	 *
	 * @param upload the entity to be inserted.
	 * @return The inserted entity.
	 * @throws UnauthorizedException
	 */
	@ApiMethod(name = "upload.insertUpload", path = "upload")
	public TextDocument insertUpload(Upload upload, User user) throws UnauthorizedException {
		// FIXME authorization check
		PersistenceManager mgr = getPersistenceManager();
		TextDocument document = null;
		try {
			if (upload.getId() != null) {
				if (containsUpload(upload)) {
					throw new EntityExistsException("Object already exists");
				}
			}

			byte[] bytes = upload.getFileData().getBytes();

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
			SAXTransformerFactory factory = (SAXTransformerFactory) SAXTransformerFactory.newInstance();
			TransformerHandler handler;

			handler = factory.newTransformerHandler();

			handler.getTransformer().setOutputProperty(OutputKeys.METHOD, "xml");
			handler.getTransformer().setOutputProperty(OutputKeys.INDENT, "no");
			handler.setResult(new StreamResult(sw));
			RTFParser parser = new RTFParser();

			InputStream is = new ByteArrayInputStream(bytes);
			// TikaInputStream tis = TikaInputStream.get(is);
			parser.parse(is, handler, metadata, new ParseContext());
			//
			String xhtml = sw.toString();
			xhtml.split("(.*<\\s*body[^>]*>)|(<\\s*/\\s*body\\s*\\>.+)");
			int start = xhtml.indexOf("<body>") + 6;
			int end = xhtml.indexOf("</body>");
			xhtml = xhtml.substring(start, end);
			return xhtml;
			//
		} catch (TransformerConfigurationException | IOException | SAXException | TikaException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return "Error while parsing RTF";
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
