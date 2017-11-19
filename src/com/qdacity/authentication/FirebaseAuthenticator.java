package com.qdacity.authentication;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.logging.Level;

import javax.jdo.PersistenceManager;
import javax.servlet.http.HttpServletRequest;

import com.google.api.server.spi.auth.common.User;
import com.google.api.server.spi.config.Authenticator;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.qdacity.Constants;
import com.qdacity.PMF;
import com.qdacity.course.Course;

/**
 * Custom authentication class that interacts with google cloud api and injects automatically a User object.
 * The user object is null if the authentication failed.
 * 
 * Usage in Endpoint:
 * @Api(
 * 	...
 *	authenticators = {FirebaseAuthenticator.class}
 * )
 * 
 * Uses the firebase admin sdk in order to validate the tokens and load User data.
 */
public class FirebaseAuthenticator implements Authenticator {
	
	/**
	 * The key in the StoredSecret table in order to retrieve the GoogleAccounts data.
	 */
	private static final String GOOGLE_CREDENTIAL_ID = "GOOGLE_CREDENTIAL_SERVICE_ACCOUNT";

	/**
	 * Setup of Firebase admin sdk.
	 * Happens once at the first api call with using the FirebaseAuthenticator.
	 * Be sure to insert the downloaded service account json object into the database with the key "GOOGLE_CREDENTIAL_SERVICE_ACCOUNT"
	 */
    static {
        try {
        	System.out.println();
 			FirebaseOptions options = new FirebaseOptions.Builder()
 					.setCredentials(loadGoogleCredential())
 					.setDatabaseUrl("https://" + Constants.FIREBASE_DATABASE_NAME + ".firebaseio.com")
 					.setProjectId(Constants.FIREBASE_PROJECT_ID)
 					.build();
	         
 			FirebaseApp.initializeApp(options);

 			java.util.logging.Logger.getLogger("logger").log(Level.INFO, "Firebase Admin SDK was successfully initialized.");
	     } catch (Exception e) {
 			java.util.logging.Logger.getLogger("logger").log(Level.SEVERE, e.getMessage());
 			e.printStackTrace();
         }
    }


    /**
     * Validates the received token and returns a User object if the token was valid.
     * @return the authenticated user or null if authentication failed.
     */
    @Override
    public User authenticate(HttpServletRequest httpServletRequest) {
        //get token
        final String authorizationHeader = httpServletRequest.getHeader("Authorization");

        //verify
        if(authorizationHeader != null) {
        	String idToken = authorizationHeader.replace("Bearer ", "");
        	FirebaseToken decodedToken;
			try {
				decodedToken = FirebaseAuth.getInstance().verifyIdTokenAsync(idToken).get();
				User user = new User(decodedToken.getUid(), decodedToken.getEmail());
	            return user;
			} catch (InterruptedException e) {
	 			java.util.logging.Logger.getLogger("logger").log(Level.WARNING, e.getMessage());
	 			e.printStackTrace();
			} catch (ExecutionException e) {
	 			java.util.logging.Logger.getLogger("logger").log(Level.WARNING, e.getMessage());
	 			e.printStackTrace();
			}
        }

        return null;
    }
    
    /**
     * loads the GoogleCredentials out of persistance store.
	 * Be sure to insert the downloaded service account json object into the database with the key "GOOGLE_CREDENTIAL_SERVICE_ACCOUNT".
	 * 
	 * On local dev server: http://localhost:8888/_ah/admin
     * @return
     */
    private static GoogleCredentials loadGoogleCredential() {
    	
    	PersistenceManager mgr = null;
		List<Course> execute = null;

		try {
			mgr = getPersistenceManager();
			
			// only call this if you want to insert the secret into your local Datastore!!
			// insertSecretKey(mgr);
			
			StoredSecret secret = mgr.getObjectById(StoredSecret.class, GOOGLE_CREDENTIAL_ID);
			InputStream stream = new ByteArrayInputStream(secret.getValue().getValue().getBytes(StandardCharsets.UTF_8.name()));
			return GoogleCredentials.fromStream(stream);
		} catch(IOException e) {
 			java.util.logging.Logger.getLogger("logger").log(Level.SEVERE, "Could not load the SecretKey for GoogleCredentials out of database.");
 			java.util.logging.Logger.getLogger("logger").log(Level.SEVERE, e.getMessage());
 			e.printStackTrace();
 			return null;
		} finally {
			mgr.close();
		}
    }

    /**
     * Use this method in order to insert your private key into the local datastore (because the integrated viewer does not offer any manipulation properties).
     * Be sure to escape all " and \'s int the String!
     * @param mgr
     */
	private static void insertSecretKey(PersistenceManager mgr) {
		java.util.logging.Logger.getLogger("logger").log(Level.SEVERE, "The insert method for the Google stored secret should not be called in production mode!");
		StoredSecret key = new StoredSecret(GOOGLE_CREDENTIAL_ID, new com.google.appengine.api.datastore.Text("placeholder"));
		mgr.makePersistent(key);
	}
    
    private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}
}