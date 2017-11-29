package com.qdacity.authentication;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.logging.Level;

import com.google.gson.Gson;
import com.qdacity.user.LoginProviderType;

/**
 * Validates an google access token (Oauth2).
 * Do not use this validator for normal client requests because of it's performance!
 */
public class GoogleAccessTokenValidator implements TokenValidator {

	private static final String VALIDATION_URL = "https://www.googleapis.com/oauth2/v3/userinfo?access_token=";
	
	/**
	 * Validate the token and return a user object.
	 * @param accessToken the access token.
	 * @return the user object or null if authentication failed.
	 */
	@Override
	public AuthenticatedUser validate(String accessToken) {
		URL url = null;
		try {
			url = new URL(GoogleAccessTokenValidator.VALIDATION_URL + accessToken);
			HttpURLConnection conn = (HttpURLConnection) url.openConnection();
			conn.setRequestMethod("GET");
			conn.connect();
			
			int responseCode = conn.getResponseCode();
			if(responseCode != HttpURLConnection.HTTP_OK) {
				java.util.logging.Logger.getLogger("logger").log(Level.WARNING, "Did no OK from token verification http request.");
				return null;
			}
			
			GoogleAccessTokenValidationResponse userInfo = extractGoogleAccessTokenValidationResponse(conn);
            
            return new AuthenticatedUser(userInfo.getSub(), userInfo.getEmail(), LoginProviderType.GOOGLE);
			
		} catch (MalformedURLException e) {
			java.util.logging.Logger.getLogger("logger").log(Level.WARNING, "The given authentication token could not be verified.");
			e.printStackTrace();
			return null;
		} catch (IOException e) {
			java.util.logging.Logger.getLogger("logger").log(Level.WARNING, "The given authentication token could not be verified.");
			e.printStackTrace();
			return null;
		}
	}


	private GoogleAccessTokenValidationResponse extractGoogleAccessTokenValidationResponse(HttpURLConnection conn) throws IOException {
		BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
		StringBuilder stringBuilder = new StringBuilder();
		String line;
		
		while ((line = bufferedReader.readLine()) != null) {
			stringBuilder.append(line+ "\n");
		}
		bufferedReader.close();
		
		String jsonResponse = stringBuilder.toString();
		GoogleAccessTokenValidationResponse userInfo = new Gson().fromJson(jsonResponse, GoogleAccessTokenValidationResponse.class);
		return userInfo;
	}

}
