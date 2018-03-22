package com.qdacity.endpoint;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.config.Named;
import com.google.api.server.spi.response.BadRequestException;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.datastore.*;
import com.qdacity.Cache;
import com.qdacity.Constants;
import com.qdacity.PMF;
import com.qdacity.authentication.AuthenticatedUser;
import com.qdacity.authentication.QdacityAuthenticator;
import com.qdacity.authentication.util.HashUtil;
import com.qdacity.authentication.util.TokenUtil;
import com.qdacity.endpoint.datastructures.StringWrapper;
import com.qdacity.user.EmailPasswordLogin;
import com.qdacity.user.LoginProviderType;
import com.qdacity.user.User;
import io.jsonwebtoken.Claims;

import javax.jdo.JDOObjectNotFoundException;
import javax.jdo.PersistenceManager;
import java.util.Arrays;
import java.util.regex.Pattern;

/**
 * This Endpoint is intented to be used for Email+Password actions.
 */
@Api(
        name = "qdacity",
        version = Constants.VERSION,
        namespace = @ApiNamespace(
                ownerDomain = "qdacity.com",
                ownerName = "qdacity.com",
                packagePath = "server.project"),
        authenticators = {QdacityAuthenticator.class}
)
public class EmailPasswordAuthenticationEndpoint {


    private static final String EMAIL_REGEX = "^(.+)@(.+)$";

    public EmailPasswordAuthenticationEndpoint() { }

    /**
     * Registers a new user.
     * This means adds the user to the database and adds an Email+Pwd LoginProvider Information
     * @param email
     * @param givenName
     * @param surName
     * @param pwd
     * @param loggedInUser
     */
    @ApiMethod(name = "authentication.registerEmailPassword")
    public User registerEmailPassword(@Named("email") String email, @Named("pwd") String pwd,
                                      @Named("givenName") String givenName, @Named("surName") String surName,
                                      com.google.api.server.spi.auth.common.User loggedInUser) throws UnauthorizedException, BadRequestException {
        Pattern pattern = Pattern.compile(EMAIL_REGEX);
        if(!pattern.matcher(email).matches()) {
            throw new BadRequestException("Code2.2: The given email adress is not in a valid format!");
        }
        if(pwd == null || pwd.isEmpty()) {
            throw new BadRequestException("Code2.3: The password must not be empty!");
        }
        assertEmailIsAvailable(email);

        HashUtil hashUtil = new HashUtil();
        String pwdHash = hashUtil.hash(pwd);

        // the id is also the email adress
        AuthenticatedUser authenticatedUser = new AuthenticatedUser(email, email, LoginProviderType.EMAIL_PASSWORD);

        UserEndpoint userEndpoint = new UserEndpoint();
        User user = new User();
        user.setEmail(email);
        user.setGivenName(givenName);
        user.setSurName(surName);
        User insertedUser = userEndpoint.insertUser(user, authenticatedUser);

        PersistenceManager pm = getPersistenceManager();
        try {
            pm.makePersistent(new EmailPasswordLogin(email, pwdHash));
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
    @ApiMethod(name = "authentication.getTokenEmailPassword")
    public StringWrapper getToken(@Named("email") String email, @Named("pwd") String pwd, com.google.api.server.spi.auth.common.User loggedInUser) throws UnauthorizedException {
        // check if user is registered
        EmailPasswordLogin emailPwd = null;
        PersistenceManager pm = getPersistenceManager();
        try {
            emailPwd = pm.getObjectById(EmailPasswordLogin.class, email);
        } catch(JDOObjectNotFoundException e) {
            throw new UnauthorizedException("Code1.1: The User with the email " + email + " could not be found!");
        }
        finally {
            pm.close();
        }

        // check if given password matches
        if(!new HashUtil().verify(pwd, emailPwd.getHashedPwd())) {
            throw new UnauthorizedException("Code1.2: The password doesn't match the account for " + email + "!");
        }

        // generate JWT token
        User user = getUserByEmailPassword(emailPwd);
        return new StringWrapper(TokenUtil.getInstance().genToken(user));
    }

    private User getUserByEmailPassword(EmailPasswordLogin emailPwd) throws UnauthorizedException {

        PersistenceManager mgr = getPersistenceManager();
        try {
            // Set filter for UserLoginProviderInformation
            com.google.appengine.api.datastore.Query.Filter externalUserIdFilter = new com.google.appengine.api.datastore.Query.FilterPredicate("externalUserId", com.google.appengine.api.datastore.Query.FilterOperator.EQUAL, emailPwd.getEmail());
            com.google.appengine.api.datastore.Query.Filter providerFilter = new com.google.appengine.api.datastore.Query.FilterPredicate("provider", com.google.appengine.api.datastore.Query.FilterOperator.EQUAL, LoginProviderType.EMAIL_PASSWORD.toString());
            com.google.appengine.api.datastore.Query.Filter filter = new com.google.appengine.api.datastore.Query.CompositeFilter(com.google.appengine.api.datastore.Query.CompositeFilterOperator.AND,
                    Arrays.asList(externalUserIdFilter, providerFilter));

            com.google.appengine.api.datastore.Query q = new com.google.appengine.api.datastore.Query(
                    "UserLoginProviderInformation").setFilter(filter);

            DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

            PreparedQuery pq = datastore.prepare(q);

            Entity providerInformationEntity = pq.asSingleEntity();

            if (providerInformationEntity == null) {
                throw new UnauthorizedException("Code1.1: User is not registered");
            }

            Key userKey = providerInformationEntity.getParent();

            User user = mgr.getObjectById(User.class, userKey.getName());

            // detatch copy, otherwise referenced default fetched objects filled with nulls
            user = mgr.detachCopy(user);
            return user;
        } finally {
            mgr.close();
        }
    }

    private void assertEmailIsAvailable(String email) throws UnauthorizedException {
        PersistenceManager pm = getPersistenceManager();
        try {
            // EmailPasswordLoginProviderInformation has externalUserId = email
            Object loginInfo = pm.getObjectById(EmailPasswordLogin.class, email);

            throw new UnauthorizedException("Code2.1: The Email is already in use!");
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
    @ApiMethod(name = "authentication.refreshToken")
    public StringWrapper refreshToken(@Named("token") String oldToken, com.google.api.server.spi.auth.common.User loggedInUser) throws UnauthorizedException {
        TokenUtil tokenUtil = TokenUtil.getInstance();
        if (!tokenUtil.verifyToken(oldToken)) {
            throw new UnauthorizedException("The given token is not valid. It also may be timed out!");
        }

        Claims claims = tokenUtil.readClaims(oldToken);
        User user = (User) Cache.getOrLoad(claims.getSubject(), User.class);
        return new StringWrapper(tokenUtil.genToken(user));
    }

    /**
     * Sets generated Pwd and sends email to user with the new pwd.
     * @param email
     * @param loggedInUser
     */
    @ApiMethod(name = "authentication.forgotPwd")
    public void forgotPwd(@Named("email") String email, com.google.api.server.spi.auth.common.User loggedInUser) {
        // TODO implement
    }


    private static PersistenceManager getPersistenceManager() {
        return PMF.get().getPersistenceManager();
    }
}
