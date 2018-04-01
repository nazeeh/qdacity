package com.qdacity.authentication;

import com.google.gson.Gson;
import com.qdacity.user.LoginProviderType;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.logging.Level;

public class FacebookTokenValidator implements TokenValidator {

    private static final String VALIDATION_URL = "https://graph.facebook.com/v2.3/me?fields=email,name&access_token=";

    @Override
    public AuthenticatedUser validate(String token) {
        URL url = null;
        try {
            url = new URL(FacebookTokenValidator.VALIDATION_URL + token);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.connect();

            int responseCode = connection.getResponseCode();
            if(responseCode != HttpURLConnection.HTTP_OK) {
                java.util.logging.Logger.getLogger("logger").log(Level.WARNING, "Did no OK from token verification http request.");
                return null;
            }

            FacebookTokenValidationResponse userInfo = extractValidationResponse(connection);

            return new AuthenticatedUser(userInfo.getId(), userInfo.getEmail(), LoginProviderType.FACEBOOK);

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

    private FacebookTokenValidationResponse extractValidationResponse(HttpURLConnection connection) throws IOException {
        BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
        StringBuilder stringBuilder = new StringBuilder();
        String line;

        while ((line = bufferedReader.readLine()) != null) {
            stringBuilder.append(line+ "\n");
        }
        bufferedReader.close();

        String jsonResponse = stringBuilder.toString();
        FacebookTokenValidationResponse userInfo = new Gson().fromJson(jsonResponse, FacebookTokenValidationResponse.class);
        return userInfo;
    }
}
