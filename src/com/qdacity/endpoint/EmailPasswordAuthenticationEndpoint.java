package com.qdacity.endpoint;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.config.Named;
import com.qdacity.Constants;
import com.qdacity.authentication.QdacityAuthenticator;
import com.qdacity.user.User;

/**
 * This Endpoint is intented to be used for Email+Password actions.
 */
@Api(name = "qdacity",
    version = Constants.VERSION,
    namespace = @ApiNamespace(ownerDomain = "qdacity.com", ownerName = "qdacity.com", packagePath = "server.project"),
    authenticators = {QdacityAuthenticator.class })
public class EmailPasswordAuthenticationEndpoint {

    public EmailPasswordAuthenticationEndpoint() { }

    /**
     * Registers a new user.
     * This means adds the user to the database and adds an Email+Pwd LoginProvider Information
     * @param user
     * @param pwd
     * @param loggedInUser
     */
    @ApiMethod(name = "authentication.emailpassword.register")
    public void registerEmailPassword(User user, @Named("pwd") String pwd, com.google.api.server.spi.auth.common.User loggedInUser) {

    }

    /**
     * Get a new JWT token by email and password
     * @param email
     * @param pwd
     * @param loggedInUser
     */
    @ApiMethod(name = "authentication.emailpassword.getToken")
    public void getToken(@Named("email") String email, @Named("pwd") String pwd, com.google.api.server.spi.auth.common.User loggedInUser) {

    }

    /**
     * Get a new JWT token by old token
     * @param oldToken
     * @param loggedInUser
     */
    @ApiMethod(name = "authentication.emailpassword.refreshToken")
    public void refreshToken(@Named("pwd") String oldToken, com.google.api.server.spi.auth.common.User loggedInUser) {

    }

    /**
     * Sets generated Pwd and sends email to user with the new pwd.
     * @param email
     * @param loggedInUser
     */
    @ApiMethod(name = "authentication.emailpassword.forgotPwd")
    public void forgotPwd(@Named("email") String email, com.google.api.server.spi.auth.common.User loggedInUser) {

    }
}
