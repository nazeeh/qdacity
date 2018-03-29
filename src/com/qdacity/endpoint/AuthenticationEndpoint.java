package com.qdacity.endpoint;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.config.Named;
import com.google.api.server.spi.response.BadRequestException;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.datastore.*;
import com.google.appengine.api.taskqueue.Queue;
import com.google.appengine.api.taskqueue.QueueFactory;
import com.qdacity.Authorization;
import com.qdacity.Cache;
import com.qdacity.Constants;
import com.qdacity.PMF;
import com.qdacity.authentication.AuthenticatedUser;
import com.qdacity.authentication.ForgotPasswordEmailSender;
import com.qdacity.authentication.GoogleIdTokenValidator;
import com.qdacity.authentication.QdacityAuthenticator;
import com.qdacity.authentication.util.HashUtil;
import com.qdacity.authentication.util.TokenUtil;
import com.qdacity.endpoint.datastructures.StringWrapper;
import com.qdacity.user.EmailPasswordLogin;
import com.qdacity.user.LoginProviderType;
import com.qdacity.user.User;
import com.qdacity.user.UserLoginProviderInformation;
import io.jsonwebtoken.Claims;

import javax.jdo.JDOObjectNotFoundException;
import javax.jdo.PersistenceManager;
import javax.jdo.annotations.Persistent;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
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
public class AuthenticationEndpoint {

    private final GoogleIdTokenValidator googleTokenValidator = new GoogleIdTokenValidator();


    private static final String EMAIL_REGEX = "^(.+)@(.+)$";
    private static final String PASSWORD_REGEX = "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=\\S+$).{7,}$";

    public AuthenticationEndpoint() { }

    /**
     * Registers a new user.
     * This means adds the user to the database and adds an Email+Pwd LoginProvider Information
     * @param email
     * @param givenName
     * @param surName
     * @param pwd
     * @param loggedInUser
     */
    @ApiMethod(name = "authentication.email.register")
    public User registerEmailPassword(@Named("email") String email, @Named("pwd") String pwd,
                                      @Named("givenName") String givenName, @Named("surName") String surName,
                                      com.google.api.server.spi.auth.common.User loggedInUser) throws UnauthorizedException, BadRequestException {
        Pattern emailPattern = Pattern.compile(EMAIL_REGEX);
        if(!emailPattern.matcher(email).matches()) {
            throw new BadRequestException("Code2.2: The given email adress is not in a valid format!");
        }
        Pattern passwordPattern = Pattern.compile(PASSWORD_REGEX);
        if(pwd == null || pwd.isEmpty()) {
            throw new BadRequestException("Code2.3: The password must not be empty!");
        }
        if(!passwordPattern.matcher(pwd).matches()) {
            throw new BadRequestException("Code2.4: The password must have at least 7 characters and must contain only and " +
                    "at least one of small letters, big letters and numbers! No Whitespaces allowed");
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
    @ApiMethod(name = "authentication.email.getToken")
    public StringWrapper getTokenEmailPassword(@Named("email") String email, @Named("pwd") String pwd, com.google.api.server.spi.auth.common.User loggedInUser) throws UnauthorizedException {
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
        AuthenticatedUser authInfo = new AuthenticatedUser(email, email, LoginProviderType.EMAIL_PASSWORD);
        return new StringWrapper(TokenUtil.getInstance().genToken(user, authInfo));
    }

    @ApiMethod(name = "authentication.google.register")
    public User registerGoogle(@Named("googleToken") String googleToken,
                               @Named("email") String email,
                               @Named("givenName") String givenName,
                               @Named("surName") String surName) throws UnauthorizedException {
        AuthenticatedUser authUser = googleTokenValidator.validate(googleToken);
        if(authUser == null) {
            throw new UnauthorizedException("Code3.1: The Google token does not seem to be valid!");
        }
        User user = new User();
        user.setEmail(email);
        user.setGivenName(givenName);
        user.setSurName(surName);

        return new UserEndpoint().insertUser(user, authUser);
    }

    @ApiMethod(name = "authentication.google.getToken")
    public StringWrapper getTokenGoogle(@Named("googleToken") String googleToken, com.google.api.server.spi.auth.common.User loggedInUser) throws UnauthorizedException {

        AuthenticatedUser authUser = googleTokenValidator.validate(googleToken);
        if(authUser == null) {
            throw new UnauthorizedException("Code4.2: The Google token does not seem to be valid!");
        }

        // check if user is registered
        try {
            User user = new UserEndpoint().getCurrentUser(authUser);

            // generate JWT token
            return new StringWrapper(TokenUtil.getInstance().genToken(user, authUser));
        } catch (JDOObjectNotFoundException e) {
            throw new UnauthorizedException("Code4.1: The User could not be found!");
        }
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
        AuthenticatedUser authInfos = new AuthenticatedUser(
                claims.get(TokenUtil.EXTERNAL_USER_ID_CLAIM, String.class),
                claims.get(TokenUtil.EXTERNAL_EMAIL_CLAIM, String.class),
                LoginProviderType.valueOf(claims.get(TokenUtil.AUTH_NETWORK_CLAIM, String.class)));
        return new StringWrapper(tokenUtil.genToken(user, authInfos));
    }

    /**
     * Sets generated Pwd and sends email to user with the new pwd.
     * @param email
     * @param loggedInUser
     */
    @ApiMethod(name = "authentication.email.forgotPwd")
    public void forgotPwd(@Named("email") String email, com.google.api.server.spi.auth.common.User loggedInUser) throws UnauthorizedException {

        // generate new password
        String generatedPassword = UUID.randomUUID().toString().replace("-", "");

        // hash new password
        String pwdHashed = new HashUtil().hash(generatedPassword);

        // store new password
        PersistenceManager pm = getPersistenceManager();
        try {
            EmailPasswordLogin emailPwd = pm.getObjectById(EmailPasswordLogin.class, email);
            emailPwd.setHashedPwd(pwdHashed);
            pm.makePersistent(emailPwd);
        } catch(JDOObjectNotFoundException e) {
            throw new UnauthorizedException("Code1.1: The User with the email " + email + " could not be found!");
        }
        finally {
            pm.close();
        }

        EmailPasswordLogin emailPwd = new EmailPasswordLogin(email, generatedPassword);
        User user = getUserByEmailPassword(emailPwd);

        // send email with new password
        ForgotPasswordEmailSender task = new ForgotPasswordEmailSender(user, email, generatedPassword);

        Queue queue = QueueFactory.getDefaultQueue();
        queue.add(com.google.appengine.api.taskqueue.TaskOptions.Builder.withPayload(task));
    }

    @ApiMethod(name="auth.getAssociatedLogins")
    public List<UserLoginProviderInformation> getAssociatedLogins(com.google.api.server.spi.auth.common.User loggedInUser) throws UnauthorizedException {

        if(loggedInUser == null) {
            throw new UnauthorizedException("Could not authenticate user.");
        }

        AuthenticatedUser authUser = (AuthenticatedUser) loggedInUser;
        User user = Cache.getOrLoadUserByAuthenticatedUser(authUser);

        Authorization.checkAuthorization(user, loggedInUser);

        return user.getLoginProviderInformation();
    }

    @ApiMethod(name="auth.associateGoogleLogin")
    public void associateGoogleLogin(@Named("googleIdToken") String googleIdToken, com.google.api.server.spi.auth.common.User loggedInUser) throws UnauthorizedException {
        AuthenticatedUser googleUser = googleTokenValidator.validate(googleIdToken);
        associateLogin((AuthenticatedUser) loggedInUser, googleUser);
    }

    private void associateLogin(AuthenticatedUser loggedInUser, AuthenticatedUser unAssociatedUser) throws UnauthorizedException {
        if(unAssociatedUser == null) {
            throw new UnauthorizedException("Code4.1: The Google token does not seem to be valid!");
        }
        User user = null;

        try {
            user = Cache.getOrLoadUserByAuthenticatedUser(unAssociatedUser);
        } catch (UnauthorizedException e) {
            // user stays null
        }

        if(user != null) {
            throw new UnauthorizedException("Code4.2: There already exists a user with this google account!");
        }

        AuthenticatedUser authUser = loggedInUser;
        user = Cache.getOrLoadUserByAuthenticatedUser(authUser);
        user.addLoginProviderInformation(new UserLoginProviderInformation(LoginProviderType.GOOGLE, unAssociatedUser.getId(), unAssociatedUser.getEmail()));

        PersistenceManager mgr = getPersistenceManager();
        try {
            mgr.makePersistent(user);
            Cache.cache(user.getId(), User.class, user);
            Cache.cacheAuthenticatedUser(authUser, user);
        } finally {
            mgr.close();
        }
    }


    private static PersistenceManager getPersistenceManager() {
        return PMF.get().getPersistenceManager();
    }
}
