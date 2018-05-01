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
import com.qdacity.authentication.*;
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
import javax.jdo.Transaction;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

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
    private final FacebookTokenValidator facebookTokenValidator = new FacebookTokenValidator();
    private final TwitterTokenValidator twitterTokenValidator = new TwitterTokenValidator();


    private static final String EMAIL_REGEX = "^(.+)@(.+)$";
    private static final String PASSWORD_REGEX = "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=\\S+$).{7,}$";

    public AuthenticationEndpoint() { }

    /**
     * Registers a new user.
     * Still has to be confirmed @see confirmEmailRegistration
     * @param email
     * @param givenName
     * @param surName
     * @param pwd
     * @param loggedInUser
     */
    @ApiMethod(name = "authentication.email.register")
    public void registerEmailPassword(@Named("email") String email, @Named("pwd") String pwd,
                                      @Named("givenName") String givenName, @Named("surName") String surName,
                                      com.google.api.server.spi.auth.common.User loggedInUser) throws UnauthorizedException, BadRequestException {
        Pattern emailPattern = Pattern.compile(EMAIL_REGEX);
        if(!emailPattern.matcher(email).matches()) {
            throw new BadRequestException("Code2.2: The given email adress is not in a valid format!");
        }
        assertPasswordValidFormat(pwd);
        assertEmailIsAvailable(email);

        HashUtil hashUtil = new HashUtil();
        String pwdHash = hashUtil.hash(pwd);
        String secret = generateLoginVerificationSecret();

        // TODO: send email with secret to user

        PersistenceManager pm = getPersistenceManager();
        try {
            UnconfirmedEmailPasswordLogin unconfirmedLogin = new UnconfirmedEmailPasswordLogin(email, pwdHash, givenName, surName, secret);
            pm.makePersistent(unconfirmedLogin); // confirmed = false
        } finally {
            pm.close();
        }
    }

    private String generateLoginVerificationSecret() {
        while(true) {
            String uuid = UUID.randomUUID().toString();
            if(this.fetchUnconfirmedEmailPasswordLoginBySecret(uuid).size() == 0) {
                return uuid;
            }
        }
    }

    private List<UnconfirmedEmailPasswordLogin> fetchUnconfirmedEmailPasswordLoginBySecret(String secret) {
        PersistenceManager mgr = null;
        try {
            mgr = getPersistenceManager();
            Query.Filter filter = new Query.FilterPredicate("secret", Query.FilterOperator.EQUAL, secret);
            com.google.appengine.api.datastore.Query query = new com.google.appengine.api.datastore.Query(
                    "UnconfirmedEmailPasswordLogin"
            ).setFilter(filter);
            DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
            PreparedQuery pq = datastore.prepare(query);

            List<UnconfirmedEmailPasswordLogin> resultList = new ArrayList<>();
            for (Entity result : pq.asIterable()) {
                String email = (String) result.getProperty("email");
                String hashedPwd = (String) result.getProperty("hashedPwd");
                String givenName = (String) result.getProperty("givenName");
                String surName = (String) result.getProperty("surName");
                Boolean confirmed = (Boolean) result.getProperty("confirmed");

                UnconfirmedEmailPasswordLogin unconfirmedEmailPasswordLogin = new UnconfirmedEmailPasswordLogin(
                        email, hashedPwd, givenName, surName, secret
                );
                unconfirmedEmailPasswordLogin.setConfirmed(confirmed);

                resultList.add(unconfirmedEmailPasswordLogin);
            }
            return resultList;
        } finally {
            mgr.close();
        }
    }

    /**
     * Inserts new user after successful confirmation.
     * @param secret
     * @param loggedInUser
     * @return
     * @throws UnauthorizedException
     * @throws BadRequestException
     */
    public User confirmEmailRegistration(@Named("secret") String secret,
                                         com.google.api.server.spi.auth.common.User loggedInUser) throws UnauthorizedException, BadRequestException {
        // get the stored EmailPasswordLogin
        List<UnconfirmedEmailPasswordLogin> unconfirmedEmailPasswordLoginList = fetchUnconfirmedEmailPasswordLoginBySecret(secret);
        if(unconfirmedEmailPasswordLoginList.size() == 0) {
            throw new BadRequestException("This Email is not waiting for confirmation!");
        }
        UnconfirmedEmailPasswordLogin unconfirmedEmailPasswordLogin = unconfirmedEmailPasswordLoginList.get(0);

        if(unconfirmedEmailPasswordLogin.isConfirmed()) {
            throw new BadRequestException("This Email is already confirmed!");
        }
        String email = unconfirmedEmailPasswordLogin.getEmail();

        // the id is also the email adress
        AuthenticatedUser authenticatedUser = new AuthenticatedUser(email, email, LoginProviderType.EMAIL_PASSWORD);

        UserEndpoint userEndpoint = new UserEndpoint();
        User user = new User();
        user.setEmail(email);
        user.setGivenName(unconfirmedEmailPasswordLogin.getGivenName());
        user.setSurName(unconfirmedEmailPasswordLogin.getSurName());
        User insertedUser = userEndpoint.insertUser(user, authenticatedUser);

        PersistenceManager pm = getPersistenceManager();
        try {
            unconfirmedEmailPasswordLogin = pm.getObjectById(UnconfirmedEmailPasswordLogin.class, email); // cannot delete transient -> fetch 2nd time
            String password = unconfirmedEmailPasswordLogin.getHashedPwd();
            pm.deletePersistent(unconfirmedEmailPasswordLogin);
            pm.makePersistent(new EmailPasswordLogin(email, password));
        } finally {
            pm.close();
        }

        return insertedUser;
    }

    private void assertPasswordValidFormat(@Named("pwd") String pwd) throws BadRequestException {
        Pattern passwordPattern = Pattern.compile(PASSWORD_REGEX);
        if(pwd == null || pwd.isEmpty()) {
            throw new BadRequestException("Code2.3: The password must not be empty!");
        }
        if(!passwordPattern.matcher(pwd).matches()) {
            throw new BadRequestException("Code2.4: The password must have at least 7 characters and must contain only and " +
                    "at least one of small letters, big letters and numbers! No Whitespaces allowed");
        }
    }

    /**
     * Get a new JWT token by email and password
     * @param email
     * @param pwd
     * @param loggedInUser
     */
    @ApiMethod(name = "authentication.email.getToken")
    public StringWrapper getTokenEmailPassword(@Named("email") String email, @Named("pwd") String pwd, com.google.api.server.spi.auth.common.User loggedInUser) throws UnauthorizedException {
        EmailPasswordLogin emailPwd = verifyPassword(email, pwd);

        // generate JWT token
        User user = getUserByEmailPassword(emailPwd);
        AuthenticatedUser authInfo = new AuthenticatedUser(email, email, LoginProviderType.EMAIL_PASSWORD);
        return new StringWrapper(TokenUtil.getInstance().genToken(user, authInfo));
    }

    private EmailPasswordLogin verifyPassword(@Named("email") String email, @Named("pwd") String pwd) throws UnauthorizedException {
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
        return emailPwd;
    }

    @ApiMethod(name = "authentication.google.register")
    public User registerGoogle(@Named("authNetworkToken") String authNetworkToken,
                               @Named("email") String email,
                               @Named("givenName") String givenName,
                               @Named("surName") String surName) throws UnauthorizedException {
        AuthenticatedUser authUser = googleTokenValidator.validate(authNetworkToken);
        if(authUser == null) {
            throw new UnauthorizedException("Code3.1: The Google token does not seem to be valid!");
        }
        User user = new User();
        user.setEmail(email);
        user.setGivenName(givenName);
        user.setSurName(surName);

        return new UserEndpoint().insertUser(user, authUser);
    }

    @ApiMethod(name = "authentication.facebook.register")
    public User registerFacebook(@Named("authNetworkToken") String authNetworkToken,
                               @Named("email") String email,
                               @Named("givenName") String givenName,
                               @Named("surName") String surName) throws UnauthorizedException {

        AuthenticatedUser authUser = facebookTokenValidator.validate(authNetworkToken);
        if(authUser == null) {
            throw new UnauthorizedException("Code3.1: The Facebook token does not seem to be valid!");
        }
        User user = new User();
        user.setEmail(email);
        user.setGivenName(givenName);
        user.setSurName(surName);

        return new UserEndpoint().insertUser(user, authUser);
    }

    @ApiMethod(name = "authentication.twitter.register")
    public User registerTwitter(@Named("authNetworkToken") String authNetworkToken,
                               @Named("email") String email,
                               @Named("givenName") String givenName,
                               @Named("surName") String surName) throws UnauthorizedException {
        AuthenticatedUser authUser = twitterTokenValidator.validate(authNetworkToken);
        if(authUser == null) {
            throw new UnauthorizedException("Code3.1: The Twitter token does not seem to be valid!");
        }
        User user = new User();
        user.setEmail(email);
        user.setGivenName(givenName);
        user.setSurName(surName);

        return new UserEndpoint().insertUser(user, authUser);
    }

    @ApiMethod(name = "authentication.google.getToken", path = "uthentication.google.getToken")
    public StringWrapper getTokenGoogle(@Named("authNetworkToken") String authNetworkToken, com.google.api.server.spi.auth.common.User loggedInUser) throws UnauthorizedException {

        AuthenticatedUser authUser = googleTokenValidator.validate(authNetworkToken);
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

    @ApiMethod(name = "authentication.facebook.getToken", path = "authentication.facebook.getToken")
    public StringWrapper getTokenFacebook(@Named("authNetworkToken") String authNetworkToken, com.google.api.server.spi.auth.common.User loggedInUser) throws UnauthorizedException {

        AuthenticatedUser authUser = facebookTokenValidator.validate(authNetworkToken);
        if(authUser == null) {
            throw new UnauthorizedException("Code4.2: The Facebook token does not seem to be valid!");
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

    @ApiMethod(name = "authentication.twitter.getToken", path = "authentication.twitter.getToken")
    public StringWrapper getTokenTwitter(@Named("authNetworkToken") String authNetworkToken, com.google.api.server.spi.auth.common.User loggedInUser) throws UnauthorizedException {

        AuthenticatedUser authUser = twitterTokenValidator.validate(authNetworkToken);
        if(authUser == null) {
            throw new UnauthorizedException("Code4.2: The Twitter token does not seem to be valid!");
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
            Object loginInfo = pm.getObjectById(EmailPasswordLogin.class, email);
            throw new UnauthorizedException("Code2.1: The Email is already in use!");
        } catch(JDOObjectNotFoundException ex) {
            // intended!

            try {
                Object loginInfo = pm.getObjectById(UnconfirmedEmailPasswordLogin.class, email);
                throw new UnauthorizedException("Code2.1: The Email is already in use, but still unconfirmed!");
            } catch(JDOObjectNotFoundException ex2) {
                // intended!
            }
        } finally {
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

    @ApiMethod(name = "auth.changePassword")
    public void changePassword(@Named("oldPassword") String oldPassword, @Named("newPassword") String newPassword, com.google.api.server.spi.auth.common.User loggedInUser) throws BadRequestException, UnauthorizedException {
        if(loggedInUser == null) {
            throw new UnauthorizedException("Could not authenticate user.");
        }
        AuthenticatedUser authUser = (AuthenticatedUser) loggedInUser;
        if(authUser.getProvider() != LoginProviderType.EMAIL_PASSWORD) {
            throw new BadRequestException("Changing password is only available for Email+Pwd Login");
        }
        assertPasswordValidFormat(newPassword);
        EmailPasswordLogin emailPwd = verifyPassword(authUser.getId(), oldPassword);

        String hashedPwd = new HashUtil().hash(newPassword);
        emailPwd.setHashedPwd(hashedPwd);

        PersistenceManager mgr = getPersistenceManager();
        try {
            mgr.makePersistent(emailPwd);
        } finally {
            mgr.close();
        }
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
        if(loggedInUser == null) {
            throw new UnauthorizedException("Could not authenticate user.");
        }

        AuthenticatedUser googleUser = googleTokenValidator.validate(googleIdToken);
        assertAssociationPreconditions(googleUser);
        associateLogin((AuthenticatedUser) loggedInUser, googleUser);
    }

    @ApiMethod(name="auth.associateFacebookLogin")
    public void associateFacebookLogin(@Named("authNetworkToken") String authNetworkToken, com.google.api.server.spi.auth.common.User loggedInUser) throws UnauthorizedException {
        if(loggedInUser == null) {
            throw new UnauthorizedException("Could not authenticate user.");
        }

        AuthenticatedUser facebookUser = facebookTokenValidator.validate(authNetworkToken);
        assertAssociationPreconditions(facebookUser);
        associateLogin((AuthenticatedUser) loggedInUser, facebookUser);
    }

    @ApiMethod(name="auth.associateTwitterLogin")
    public void associateTwitterLogin(@Named("authNetworkToken") String authNetworkToken, com.google.api.server.spi.auth.common.User loggedInUser) throws UnauthorizedException {
        if(loggedInUser == null) {
            throw new UnauthorizedException("Could not authenticate user.");
        }

        AuthenticatedUser twitterUser = twitterTokenValidator.validate(authNetworkToken);
        assertAssociationPreconditions(twitterUser);
        associateLogin((AuthenticatedUser) loggedInUser, twitterUser);
    }

    @ApiMethod(name="auth.associateEmailPassword")
    public void associateEmailPassword(@Named("email") String email, @Named("password") String password, com.google.api.server.spi.auth.common.User loggedInUser) throws UnauthorizedException, BadRequestException {
        if(loggedInUser == null) {
            throw new UnauthorizedException("Could not authenticate user.");
        }

        Pattern emailPattern = Pattern.compile(EMAIL_REGEX);
        if(!emailPattern.matcher(email).matches()) {
            throw new BadRequestException("Code4.3: The given email adress is not in a valid format!");
        }
        Pattern passwordPattern = Pattern.compile(PASSWORD_REGEX);
        if(password == null || password.isEmpty()) {
            throw new BadRequestException("Code4.4: The password must not be empty!");
        }
        if(!passwordPattern.matcher(password).matches()) {
            throw new BadRequestException("Code4.5: The password must have at least 7 characters and must contain only and " +
                    "at least one of small letters, big letters and numbers! No Whitespaces allowed");
        }
        assertEmailIsAvailable(email);

        AuthenticatedUser unassociatedUser = new AuthenticatedUser(email, email, LoginProviderType.EMAIL_PASSWORD);
        assertAssociationPreconditions(unassociatedUser);

        HashUtil hashUtil = new HashUtil();
        String pwdHash = hashUtil.hash(password);

        EmailPasswordLogin emailPwd = new EmailPasswordLogin(email, pwdHash);

        PersistenceManager mgr = getPersistenceManager();
        try {
            mgr.makePersistent(emailPwd);
        } finally {
            mgr.close();
        }
        associateLogin((AuthenticatedUser) loggedInUser, unassociatedUser);
    }

    @SuppressWarnings("ResourceParameter")
    @ApiMethod(name="auth.disassociateLogin")
    public void disassociateLogin(UserLoginProviderInformation associatedLogin, com.google.api.server.spi.auth.common.User loggedInUser) throws UnauthorizedException, BadRequestException {
        if (loggedInUser == null) {
            throw new UnauthorizedException("Could not authenticate user.");
        }

        AuthenticatedUser authUser = (AuthenticatedUser) loggedInUser;
        User user = Cache.getOrLoadUserByAuthenticatedUser(authUser);

        int sizeBeforeRemove = user.getLoginProviderInformation().size();

        if(user.getLoginProviderInformation().size() == 1) {
            throw new BadRequestException("The last associated Login cannot be deleted!");
        }

        List<UserLoginProviderInformation> stayingLoginInfos = user.getLoginProviderInformation().stream()
                .filter((loginInfo) -> !(loginInfo.getExternalUserId().equals(associatedLogin.getExternalUserId()) && loginInfo.getProvider().equals(associatedLogin.getProvider())))
                .collect(Collectors.toList());
        user.setLoginProviderInformation(stayingLoginInfos);

        if (stayingLoginInfos.size() == sizeBeforeRemove) {
            throw new BadRequestException("This associated Login does not exist.");
        }

        PersistenceManager mgr = getPersistenceManager();
        Transaction transaction = mgr.currentTransaction();
        try {
            transaction.begin(); // transaction in order to update dependent relation
            mgr.makePersistent(user);

            // Set filter for UserLoginProviderInformation
            Query.Filter externalUserIdFilter = new Query.FilterPredicate("externalUserId", Query.FilterOperator.EQUAL, associatedLogin.getExternalUserId());
            Query.Filter providerFilter = new Query.FilterPredicate("provider", Query.FilterOperator.EQUAL, associatedLogin.getProvider().toString());
            Query.Filter filter = new Query.CompositeFilter(Query.CompositeFilterOperator.AND,
                    Arrays.asList(externalUserIdFilter, providerFilter));
            com.google.appengine.api.datastore.Query q = new com.google.appengine.api.datastore.Query(
                    "UserLoginProviderInformation").setFilter(filter);
            DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
            PreparedQuery pq = datastore.prepare(q);
            Entity providerInformationEntity = pq.asSingleEntity();
            datastore.delete(providerInformationEntity.getKey());

            transaction.commit();

            if(associatedLogin.getProvider().equals(LoginProviderType.EMAIL_PASSWORD)) {
                EmailPasswordLogin emailPwd = mgr.getObjectById(EmailPasswordLogin.class, associatedLogin.getExternalEmail());
                mgr.deletePersistent(emailPwd);
            }


            Cache.cache(user.getId(), User.class, user);
            Cache.invalidatUserLogins(user); // make sure the associatedLogin is not chached any more.
            Cache.cacheAuthenticatedUser(authUser, user);
        } finally {
            if(transaction.isActive()) {
                transaction.rollback();
            }
            mgr.close();
        }
    }

    private void associateLogin(AuthenticatedUser loggedInUser, AuthenticatedUser unAssociatedUser) throws UnauthorizedException {
        AuthenticatedUser authUser = loggedInUser;
        User user = Cache.getOrLoadUserByAuthenticatedUser(authUser);
        user.addLoginProviderInformation(new UserLoginProviderInformation(unAssociatedUser.getProvider(), unAssociatedUser.getId(), unAssociatedUser.getEmail()));

        PersistenceManager mgr = getPersistenceManager();
        try {
            mgr.makePersistent(user);
            Cache.cache(user.getId(), User.class, user);
            Cache.cacheAuthenticatedUser(authUser, user);
        } finally {
            mgr.close();
        }
    }

    /**
     * Checks some preconditions for associating a login.
     * @param unAssociatedUser
     * @return
     * @throws UnauthorizedException
     */
    private void assertAssociationPreconditions(AuthenticatedUser unAssociatedUser) throws UnauthorizedException {
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
    }


    private static PersistenceManager getPersistenceManager() {
        return PMF.get().getPersistenceManager();
    }
}
