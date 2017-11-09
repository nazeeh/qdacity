package com.qdacity.authentication;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.concurrent.ExecutionException;

import javax.servlet.http.HttpServletRequest;

import com.google.api.server.spi.auth.common.User;
import com.google.api.server.spi.config.Authenticator;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseCredentials;
import com.google.firebase.auth.FirebaseToken;
import com.qdacity.Constants;

public class FirebaseAuthenticator implements Authenticator {

    static {
        try {
	         InputStream serviceAccount = new FileInputStream(
	                 new File("WEB-INF/service-account-credentials.json"));
	         FirebaseOptions options = new FirebaseOptions.Builder()
	                 .setCredential(FirebaseCredentials.fromCertificate(serviceAccount))
	                 .setDatabaseUrl("https://" + Constants.FIREBASE_PROJECT_ID + ".firebaseio.com")
	                 .build();
	
	         FirebaseApp.initializeApp(options);
	
	     } catch (Exception e) {
	         // logger.log(Level.SEVERE, e.toString(), e);
	    	 e.printStackTrace();
         }
    }


    @Override
    public User authenticate(HttpServletRequest httpServletRequest) {
    	
    	System.out.println("Debug authenticator for firebase token");
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
				// TODO Auto-generated catch block
				e.printStackTrace();
			} catch (ExecutionException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
        }

        return null;
    }
}