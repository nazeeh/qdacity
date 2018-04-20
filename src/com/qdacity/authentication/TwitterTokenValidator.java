package com.qdacity.authentication;

import com.qdacity.Constants;
import com.qdacity.user.LoginProviderType;
import twitter4j.Twitter;
import twitter4j.TwitterException;
import twitter4j.TwitterFactory;
import twitter4j.conf.ConfigurationBuilder;

import java.util.logging.Level;
import java.util.logging.Logger;

public class TwitterTokenValidator implements TokenValidator {

    @Override
    public AuthenticatedUser validate(String token) {
        String[] tokenParts = token.split("@");
        if(tokenParts.length != 2) {
            Logger.getLogger("logger").log(Level.INFO, "Twitter token was not in right format (@)");
        }
        String firstPart = tokenParts[0];
        String[] tokenSubParts = firstPart.split(":");
        if(tokenParts.length != 2) {
            Logger.getLogger("logger").log(Level.INFO, "Twitter token was not in right format (:)");
        }
        String accessToken = tokenSubParts[0];
        String accessTokenSecret = tokenSubParts[1];

        ConfigurationBuilder builder = new ConfigurationBuilder()
            .setOAuthConsumerKey(Constants.TWITTER_CONSUMER_KEY)
            .setOAuthConsumerSecret(Constants.TWITTER_CONSUMER_SECRET)
            .setOAuthAccessToken(accessToken)
            .setOAuthAccessTokenSecret(accessTokenSecret);
        builder.setIncludeEmailEnabled(true);
        Twitter twitter = new TwitterFactory(builder.build()).getInstance();

        try {
            twitter4j.User twitterUser = twitter.verifyCredentials();
            return new AuthenticatedUser(
                    twitterUser.getId() + "",
                    twitterUser.getEmail(),
                    LoginProviderType.TWITTER
            );
        } catch (TwitterException e) {
            Logger.getLogger("logger").log(Level.INFO, "Failed to verify twitter token: " + token, e);
            return null;
        }
    }
}
