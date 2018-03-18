package com.qdacity.endpoint;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.config.Named;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.datastore.*;
import com.qdacity.Constants;
import com.qdacity.PMF;
import com.qdacity.authentication.AuthenticatedUser;
import com.qdacity.authentication.QdacityAuthenticator;
import com.qdacity.authentication.util.HashUtil;
import com.qdacity.user.EmailPasswordLogin;
import com.qdacity.user.LoginProviderType;
import com.qdacity.user.User;
import com.qdacity.user.UserLoginProviderInformation;

import javax.jdo.JDOObjectNotFoundException;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import java.util.Arrays;
import java.util.List;

/**
 * This Endpoint is intented to be used for Email+Password actions.
 */
@SuppressWarnings("ResourceParameter")
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
    public User registerEmailPassword(User user, @Named("pwd") String pwd, com.google.api.server.spi.auth.common.User loggedInUser) throws UnauthorizedException {
        assertEmailIsAvailable(user.getEmail());

        HashUtil hashUtil = new HashUtil();
        String pwdHash = hashUtil.hash(pwd);

        // the id is also the email adress
        AuthenticatedUser authenticatedUser = new AuthenticatedUser(user.getEmail(), user.getEmail(), LoginProviderType.EMAIL_PASSWORD);

        UserEndpoint userEndpoint = new UserEndpoint();
        User insertedUser = userEndpoint.insertUser(user, authenticatedUser);

        PersistenceManager pm = getPersistenceManager();
        try {
            pm.makePersistent(new EmailPasswordLogin(user.getEmail(), pwdHash));
        } finally {
            pm.close();
        }
        return insertedUser;
    }

    /**
     * Get a new JWT token by email and password
     * @param email
     * @param pwd
     * @param loggedInUser
     */
    @ApiMethod(name = "authentication.emailpassword.getToken")
    public void getToken(@Named("email") String email, @Named("pwd") String pwd, com.google.api.server.spi.auth.common.User loggedInUser) throws UnauthorizedException {

        // TODO implement
    }

    private void assertEmailIsAvailable(String email) throws UnauthorizedException {
        PersistenceManager pm = getPersistenceManager();
        try {
            // EmailPasswordLoginProviderInformation has externalUserId = email
            Object loginInfo = pm.getObjectById(EmailPasswordLogin.class, email);

            throw new UnauthorizedException("The Email is already in use!");
        } catch(JDOObjectNotFoundException ex) {
            // intended!
        }finally {
            pm.close();
        }
    }

    /**
     * Get a new JWT token by old token
     * @param oldToken
     * @param loggedInUser
     */
    @ApiMethod(name = "authentication.emailpassword.refreshToken")
    public void refreshToken(@Named("pwd") String oldToken, com.google.api.server.spi.auth.common.User loggedInUser) {
        // TODO implement
    }

    /**
     * Sets generated Pwd and sends email to user with the new pwd.
     * @param email
     * @param loggedInUser
     */
    @ApiMethod(name = "authentication.emailpassword.forgotPwd")
    public void forgotPwd(@Named("email") String email, com.google.api.server.spi.auth.common.User loggedInUser) {
        // TODO implement
    }


    private static PersistenceManager getPersistenceManager() {
        return PMF.get().getPersistenceManager();
    }
}
