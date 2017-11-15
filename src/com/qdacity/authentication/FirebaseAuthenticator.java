package com.qdacity.authentication;

import java.io.InputStream;
import java.util.concurrent.ExecutionException;
import java.util.logging.Level;

import javax.servlet.http.HttpServletRequest;

import org.apache.tika.io.IOUtils;

import com.google.api.server.spi.auth.common.User;
import com.google.api.server.spi.config.Authenticator;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseCredentials;
import com.google.firebase.auth.FirebaseToken;
import com.qdacity.Constants;

/**
 * Custom authentication class that interacts with google cloud api and injects automatically a User object.
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
	 */
    static {
        try {
        	String jsonCredentials = "TODO: put here your service token!";	
        	InputStream serviceAccount = IOUtils.toInputStream(jsonCredentials);
 			FirebaseOptions options = new FirebaseOptions.Builder()
 					.setCredential(FirebaseCredentials.fromCertificate(serviceAccount))
 					.setDatabaseUrl("https://" + Constants.FIREBASE_PROJECT_ID + ".firebaseio.com")
 					.build();
	         
 			FirebaseApp.initializeApp(options);

	     } catch (Exception e) {
	 			java.util.logging.Logger.getLogger("logger").log(Level.SEVERE, e.getMessage());
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
			} catch (ExecutionException e) {
	 			java.util.logging.Logger.getLogger("logger").log(Level.WARNING, e.getMessage());
			}
        }

        return null;
    }
}