package com.qdacity.authentication;

import java.util.concurrent.ExecutionException;
import java.util.logging.Level;

import javax.servlet.http.HttpServletRequest;

import com.google.api.server.spi.auth.common.User;
import com.google.api.server.spi.config.Authenticator;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.qdacity.Constants;

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
	 * Setup of Firebase admin sdk.
	 * Happens once at the first api call with using the FirebaseAuthenticator.
	 * Be sure to have the path to your service account json in an environment variable called GOOGLE_APPLICATION_CREDENTIALS.
	 */
    static {
        try {
        	GoogleCredentials credentials = GoogleCredentials.getApplicationDefault();

 			java.util.logging.Logger.getLogger("logger").log(Level.INFO, "Google Credentials: " + credentials.getAccessToken());
        	System.out.println();
 			FirebaseOptions options = new FirebaseOptions.Builder()
 					.setCredentials(credentials)
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
}