package com.qdacity.test.EmailPasswordAuthenticationEndpoint;

import com.google.api.server.spi.response.BadRequestException;
import com.google.api.server.spi.response.InternalServerErrorException;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
import com.google.appengine.tools.development.testing.LocalTaskQueueTestConfig;
import com.qdacity.PMF;
import com.qdacity.authentication.AuthenticatedUser;
import com.qdacity.authentication.CustomJWTValidator;
import com.qdacity.authentication.TokenValidator;
import com.qdacity.authentication.UnconfirmedEmailPasswordLogin;
import com.qdacity.authentication.util.TokenUtil;
import com.qdacity.endpoint.AuthenticationEndpoint;
import com.qdacity.endpoint.UserEndpoint;
import com.qdacity.user.LoginProviderType;
import com.qdacity.user.User;
import com.qdacity.user.UserLoginProviderInformation;
import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;

import javax.jdo.PersistenceManager;
import java.util.List;

import static org.junit.Assert.*;

public class AuthenticationEndpointTest {

    private final LocalTaskQueueTestConfig.TaskCountDownLatch latch = new LocalTaskQueueTestConfig.TaskCountDownLatch(1);
    private final LocalServiceTestHelper helper = new LocalServiceTestHelper(new LocalDatastoreServiceTestConfig(), new LocalTaskQueueTestConfig().setQueueXmlPath("war/WEB-INF/queue.xml").setDisableAutoTaskExecution(false).setCallbackClass(LocalTaskQueueTestConfig.DeferredTaskCallback.class).setTaskExecutionLatch(latch));

    @Rule
    public ExpectedException thrown = ExpectedException.none();

    @Before
    public void setUp() {
        helper.setUp();
    }

    @After
    public void tearDown() {
        latch.reset(1);
        helper.tearDown();
    }

    @Test
	public void testRegisterNoConfirmation() throws UnauthorizedException, BadRequestException {
		User unregisteredUser = new User();
		unregisteredUser.setGivenName("given-name");
		unregisteredUser.setSurName("sur-name");
		unregisteredUser.setEmail("email@email.com");
		AuthenticationEndpoint endpoint = new AuthenticationEndpoint();

		String password = "Password123";
		endpoint.registerEmailPassword(unregisteredUser.getEmail(), password,
				unregisteredUser.getGivenName(), unregisteredUser.getSurName(), null);

		thrown.expect(UnauthorizedException.class);
		thrown.expectMessage("Code1.1: The User with the email " + unregisteredUser.getEmail() + " could not be found!");
		endpoint.getTokenEmailPassword(unregisteredUser.getEmail(), password, null);
	}

    @Test
    public void testRegister() throws UnauthorizedException, BadRequestException {
        User unregisteredUser = new User();
        unregisteredUser.setGivenName("given-name");
        unregisteredUser.setSurName("sur-name");
        unregisteredUser.setEmail("email@email.com");

        User registeredUser = registerUser(unregisteredUser, "Password123");

        AuthenticatedUser authenticatedUser = new AuthenticatedUser(
                registeredUser.getLoginProviderInformation().get(0).getExternalUserId(),
                registeredUser.getEmail(), LoginProviderType.EMAIL_PASSWORD);

        UserEndpoint ue = new UserEndpoint();
        ue.getCurrentUser(authenticatedUser);
    }

    @Test(expected= BadRequestException.class)
    public void testRegisterEmptyPassword() throws UnauthorizedException, BadRequestException {
        new AuthenticationEndpoint().registerEmailPassword("email@email.de", "", "a", "b", null);
    }

    @Test(expected= BadRequestException.class)
    public void testRegisterPasswordNull() throws UnauthorizedException, BadRequestException {
        new AuthenticationEndpoint().registerEmailPassword("email@email.de", null, "a", "b", null);
    }

    @Test
    public void testRegisterPasswordInvlaidFormaat() throws UnauthorizedException, BadRequestException {
        String[] invalidPasswords = {"aasdasasdd", "AAAAAAAAAA", "237483597", "AAAAaaaaaaaa", "AAAAAAAAAA123234", "aaaaaaaaaaaa123123", "A123a", "A123djsfh asd12"};
        for(String invalidPassword: invalidPasswords) {
            try {
                new AuthenticationEndpoint().registerEmailPassword("email@email.de", invalidPassword, "a", "b", null);
                fail(invalidPassword);
            } catch(BadRequestException e) {
                // intended
            }
        }
    }

    @Test
    public void testRegisterInvalidEmail() throws UnauthorizedException, BadRequestException {
        String[] invalidEmails = {"a", "a@", "@b", "a@b", "a@b.", "@b.de", "a.de", "a@.de"};
        for(String invalidEmail: invalidEmails) {
            try {
                new AuthenticationEndpoint().registerEmailPassword(invalidEmail, "a", "a", "b", null);
                fail(invalidEmail);
            } catch(BadRequestException e) {
                // intended
            }
        }
    }


    @Test(expected = UnauthorizedException.class)
    public void testRegisterSameEmail() throws UnauthorizedException, BadRequestException {
        User unregisteredUser = new User();
        unregisteredUser.setGivenName("given-name");
        unregisteredUser.setSurName("sur-name");
        unregisteredUser.setEmail("email@email.com");
        AuthenticationEndpoint endpoint = new AuthenticationEndpoint();

        registerUser(unregisteredUser, "Password123");
        registerUser(unregisteredUser, "Password123");
    }

    @Test
    public void testGetTokenAndRefresh() throws UnauthorizedException, InterruptedException, BadRequestException {
        TokenValidator emailpwdTokenValidator = new CustomJWTValidator();
        User unregisteredUser = new User();
        unregisteredUser.setGivenName("given-name");
        unregisteredUser.setSurName("sur-name");
        unregisteredUser.setEmail("email@email.com");
        AuthenticationEndpoint endpoint = new AuthenticationEndpoint();

        String password = "Password123";
        User registeredUser = registerUser(unregisteredUser, password);

        String token = new AuthenticationEndpoint().getTokenEmailPassword(unregisteredUser.getEmail(), password, null).getValue();
        assertTrue(TokenUtil.getInstance().verifyToken(token));
        AuthenticatedUser authUser = emailpwdTokenValidator.validate(token);
        assertEquals(unregisteredUser.getEmail(), authUser.getId());
        assertEquals(unregisteredUser.getEmail(), authUser.getEmail());
        assertEquals(LoginProviderType.EMAIL_PASSWORD, authUser.getProvider());
        User user = new UserEndpoint().getCurrentUser(authUser);
        assertEquals(unregisteredUser.getEmail(), user.getEmail());
        assertEquals(registeredUser.getId(), user.getId());

        Thread.sleep(1000); // two tokens generated in same second are equal (not the typical use-case)
        String refreshedToken = new AuthenticationEndpoint().refreshToken(token, null).getValue();
        assertNotEquals(token, refreshedToken);
        assertTrue(TokenUtil.getInstance().verifyToken(refreshedToken));
        authUser = emailpwdTokenValidator.validate(refreshedToken);
        assertEquals(unregisteredUser.getEmail(), authUser.getId());
        assertEquals(unregisteredUser.getEmail(), authUser.getEmail());
        assertEquals(LoginProviderType.EMAIL_PASSWORD, authUser.getProvider());
        user = new UserEndpoint().getCurrentUser(authUser);
        assertEquals(unregisteredUser.getEmail(), user.getEmail());
        assertEquals(registeredUser.getId(), user.getId());
    }

    @Test(expected = UnauthorizedException.class)
    public void testGetTokenNotRegistered() throws UnauthorizedException {
        new AuthenticationEndpoint().getTokenEmailPassword("not@exists.de", "abc", null);
    }

    @Test(expected = UnauthorizedException.class)
    public void testGetTokenIncorrectPwd() throws UnauthorizedException, BadRequestException {
        User unregisteredUser = new User();
        unregisteredUser.setGivenName("given-name");
        unregisteredUser.setSurName("sur-name");
        unregisteredUser.setEmail("email@email.com");
        AuthenticationEndpoint endpoint = new AuthenticationEndpoint();

        String password = "Password123";
        User registeredUser = registerUser(unregisteredUser, password);
        endpoint.getTokenEmailPassword(registeredUser.getEmail(), "Password456", null); // wrong pwd
    }

    @Test(expected = UnauthorizedException.class)
    public void testRefreshTokenInvalidToken() throws UnauthorizedException {

        User unregisteredUser = new User();
        unregisteredUser.setGivenName("given-name");
        unregisteredUser.setSurName("sur-name");
        unregisteredUser.setEmail("email@email.com");

        String refreshedToken = new AuthenticationEndpoint().refreshToken("sdfjklsjeiljfs", null).getValue();
    }


    @Test
    public void testGetAssociatedLogins() throws UnauthorizedException, BadRequestException {

        User unregisteredUser = new User();
        unregisteredUser.setGivenName("given-name");
        unregisteredUser.setSurName("sur-name");
        unregisteredUser.setEmail("email@email.com");

        User registeredUser = this.registerUser(unregisteredUser, "Password123");

        AuthenticatedUser authenticatedUser = new AuthenticatedUser(
                registeredUser.getLoginProviderInformation().get(0).getExternalUserId(),
                registeredUser.getEmail(), LoginProviderType.EMAIL_PASSWORD);

        List<UserLoginProviderInformation> associatedLogins = new AuthenticationEndpoint().getAssociatedLogins(authenticatedUser);
        assertEquals(1, associatedLogins.size());

        UserLoginProviderInformation associatedLogin = associatedLogins.get(0);
        assertEquals(registeredUser.getLoginProviderInformation().get(0).getProvider(), associatedLogin.getProvider());
        assertEquals(registeredUser.getLoginProviderInformation().get(0).getExternalEmail(), associatedLogin.getExternalEmail());
        assertEquals(registeredUser.getLoginProviderInformation().get(0).getExternalEmail(), associatedLogin.getExternalUserId());
    }

    @Test
    public void testAssociateEmailPasswordAndDisassociate() throws UnauthorizedException, BadRequestException, InternalServerErrorException {
        User unregisteredUser = new User();
        unregisteredUser.setGivenName("given-name");
        unregisteredUser.setSurName("sur-name");
        unregisteredUser.setEmail("email@email.com");

        User registeredUser = this.registerUser(unregisteredUser, "Password123");

        AuthenticatedUser authenticatedUser = new AuthenticatedUser(
                registeredUser.getLoginProviderInformation().get(0).getExternalUserId(),
                registeredUser.getEmail(), LoginProviderType.EMAIL_PASSWORD);

        List<UserLoginProviderInformation> associatedLogins = new AuthenticationEndpoint().getAssociatedLogins(authenticatedUser);
        assertEquals(1, associatedLogins.size());

        String associatedEmail = "associate@email.de";
        String associetedPwd = "Password456";
        new AuthenticationEndpoint().associateEmailPassword(associatedEmail, associetedPwd, authenticatedUser);

        associatedLogins = new AuthenticationEndpoint().getAssociatedLogins(authenticatedUser);
        assertEquals(2, associatedLogins.size());

        String token = new AuthenticationEndpoint().getTokenEmailPassword(associatedEmail, associetedPwd, null).getValue();

        new AuthenticationEndpoint().disassociateLogin(associatedLogins.get(1), authenticatedUser);

        associatedLogins = new AuthenticationEndpoint().getAssociatedLogins(authenticatedUser);
        assertEquals(1, associatedLogins.size());
    }

    @Test(expected = BadRequestException.class)
    public void testDisassociateLast() throws UnauthorizedException, BadRequestException, InternalServerErrorException {
        User unregisteredUser = new User();
        unregisteredUser.setGivenName("given-name");
        unregisteredUser.setSurName("sur-name");
        unregisteredUser.setEmail("email@email.com");

        User registeredUser = this.registerUser(unregisteredUser, "Password123");

        AuthenticatedUser authenticatedUser = new AuthenticatedUser(
                registeredUser.getLoginProviderInformation().get(0).getExternalUserId(),
                registeredUser.getEmail(), LoginProviderType.EMAIL_PASSWORD);

        List<UserLoginProviderInformation> associatedLogins = new AuthenticationEndpoint().getAssociatedLogins(authenticatedUser);
        assertEquals(1, associatedLogins.size());

        new AuthenticationEndpoint().disassociateLogin(associatedLogins.get(0), authenticatedUser);
    }

    @Test
    public void testChangePwd() throws BadRequestException, UnauthorizedException {
        User unregisteredUser = new User();
        unregisteredUser.setGivenName("given-name");
        unregisteredUser.setSurName("sur-name");
        unregisteredUser.setEmail("email@email.com");

        String password = "Password123";
        User registeredUser = this.registerUser(unregisteredUser, password);

        AuthenticatedUser authenticatedUser = new AuthenticatedUser(
                registeredUser.getLoginProviderInformation().get(0).getExternalUserId(),
                registeredUser.getEmail(), LoginProviderType.EMAIL_PASSWORD);

        new AuthenticationEndpoint().getTokenEmailPassword(unregisteredUser.getEmail(), password, null);

        String changedPassword = "Password456";
        new AuthenticationEndpoint().changePassword(password, changedPassword, authenticatedUser);
        try {
            new AuthenticationEndpoint().getTokenEmailPassword(unregisteredUser.getEmail(), password, null);
            fail("Could sign in with old password");
        } catch (UnauthorizedException ex) {
            // expected
        }
        new AuthenticationEndpoint().getTokenEmailPassword(unregisteredUser.getEmail(), changedPassword, null);
    }

    @Test(expected = UnauthorizedException.class)
    public void testChangePwdWrongOldPwd() throws UnauthorizedException, BadRequestException {
        User unregisteredUser = new User();
        unregisteredUser.setGivenName("given-name");
        unregisteredUser.setSurName("sur-name");
        unregisteredUser.setEmail("email@email.com");

        String password = "Password123";
        User registeredUser = this.registerUser(unregisteredUser, password);

        AuthenticatedUser authenticatedUser = new AuthenticatedUser(
                registeredUser.getLoginProviderInformation().get(0).getExternalUserId(),
                registeredUser.getEmail(), LoginProviderType.EMAIL_PASSWORD);

        new AuthenticationEndpoint().getTokenEmailPassword(unregisteredUser.getEmail(), password, null);

        String changedPassword = "Password456";
        new AuthenticationEndpoint().changePassword(changedPassword, changedPassword, authenticatedUser);
    }

    private User registerUser(User unregisteredUser, String password) throws UnauthorizedException, BadRequestException {
        new AuthenticationEndpoint().registerEmailPassword(unregisteredUser.getEmail(), password,
                unregisteredUser.getGivenName(), unregisteredUser.getSurName(), null);

        UnconfirmedEmailPasswordLogin unconfirmedEmailPasswordLogin = null;
        PersistenceManager mgr = getPersistenceManager();
        try {
            unconfirmedEmailPasswordLogin = mgr.getObjectById(UnconfirmedEmailPasswordLogin.class, unregisteredUser.getEmail());
        } finally {
            mgr.close();
        }

        return new AuthenticationEndpoint().confirmEmailRegistration(unconfirmedEmailPasswordLogin.getSecret(), null);
    }



    private static PersistenceManager getPersistenceManager() {
        return PMF.get().getPersistenceManager();
    }
}
