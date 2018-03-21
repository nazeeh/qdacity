package com.qdacity.test.EmailPasswordAuthenticationEndpoint;

import com.google.api.server.spi.response.BadRequestException;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
import com.google.appengine.tools.development.testing.LocalTaskQueueTestConfig;
import com.qdacity.authentication.AuthenticatedUser;
import com.qdacity.authentication.EmailPasswordValidator;
import com.qdacity.authentication.TokenValidator;
import com.qdacity.authentication.util.TokenUtil;
import com.qdacity.endpoint.EmailPasswordAuthenticationEndpoint;
import com.qdacity.endpoint.UserEndpoint;
import com.qdacity.user.LoginProviderType;
import com.qdacity.user.User;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import static org.junit.Assert.*;

public class EmailPasswordAuthenticationEndpointTest {

    private final LocalTaskQueueTestConfig.TaskCountDownLatch latch = new LocalTaskQueueTestConfig.TaskCountDownLatch(1);
    private final LocalServiceTestHelper helper = new LocalServiceTestHelper(new LocalDatastoreServiceTestConfig(), new LocalTaskQueueTestConfig().setQueueXmlPath("war/WEB-INF/queue.xml").setDisableAutoTaskExecution(false).setCallbackClass(LocalTaskQueueTestConfig.DeferredTaskCallback.class).setTaskExecutionLatch(latch));

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
    public void testRegister() throws UnauthorizedException, BadRequestException {
        User unregisteredUser = new User();
        unregisteredUser.setGivenName("given-name");
        unregisteredUser.setSurName("sur-name");
        unregisteredUser.setEmail("email@email.com");
        EmailPasswordAuthenticationEndpoint endpoint = new EmailPasswordAuthenticationEndpoint();

        User registeredUser = registerUser(unregisteredUser, "pw");

        AuthenticatedUser authenticatedUser = new AuthenticatedUser(
                registeredUser.getLoginProviderInformation().get(0).getExternalUserId(),
                registeredUser.getEmail(), LoginProviderType.EMAIL_PASSWORD);

        UserEndpoint ue = new UserEndpoint();
        ue.getCurrentUser(authenticatedUser);
    }

    @Test(expected= BadRequestException.class)
    public void testRegisterEmptyPassword() throws UnauthorizedException, BadRequestException {
        new EmailPasswordAuthenticationEndpoint().registerEmailPassword("email@email.de", "", "a", "b", null);
    }

    @Test(expected= BadRequestException.class)
    public void testRegisterPasswordNull() throws UnauthorizedException, BadRequestException {
        new EmailPasswordAuthenticationEndpoint().registerEmailPassword("email@email.de", null, "a", "b", null);
    }

    @Test(expected= BadRequestException.class)
    public void testRegisterInvalidEmail() throws UnauthorizedException, BadRequestException {
        String[] invalidEmails = {"a", "a@", "@b", "a@b", "a@b.", "@b.de", "a.de", "a@.de"};
        for(String invalidEmail: invalidEmails) {
            new EmailPasswordAuthenticationEndpoint().registerEmailPassword(invalidEmail, "a", "a", "b", null);
        }
    }


    @Test(expected = UnauthorizedException.class)
    public void testRegisterSameEmail() throws UnauthorizedException, BadRequestException {
        User unregisteredUser = new User();
        unregisteredUser.setGivenName("given-name");
        unregisteredUser.setSurName("sur-name");
        unregisteredUser.setEmail("email@email.com");
        EmailPasswordAuthenticationEndpoint endpoint = new EmailPasswordAuthenticationEndpoint();

        registerUser(unregisteredUser, "pw");
        registerUser(unregisteredUser, "pw");
    }

    @Test
    public void testGetTokenAndRefresh() throws UnauthorizedException, InterruptedException, BadRequestException {
        TokenValidator emailpwdTokenValidator = new EmailPasswordValidator();
        User unregisteredUser = new User();
        unregisteredUser.setGivenName("given-name");
        unregisteredUser.setSurName("sur-name");
        unregisteredUser.setEmail("email@email.com");
        EmailPasswordAuthenticationEndpoint endpoint = new EmailPasswordAuthenticationEndpoint();

        String password = "password";
        User registeredUser = registerUser(unregisteredUser, password);

        String token = new EmailPasswordAuthenticationEndpoint().getToken(unregisteredUser.getEmail(), password, null).getValue();
        assertTrue(TokenUtil.getInstance().verifyToken(token));
        AuthenticatedUser authUser = emailpwdTokenValidator.validate(token);
        assertEquals(unregisteredUser.getEmail(), authUser.getId());
        assertEquals(unregisteredUser.getEmail(), authUser.getEmail());
        assertEquals(LoginProviderType.EMAIL_PASSWORD, authUser.getProvider());
        User user = new UserEndpoint().getCurrentUser(authUser);
        assertEquals(unregisteredUser.getEmail(), user.getEmail());
        assertEquals(registeredUser.getId(), user.getId());

        Thread.sleep(1000); // two tokens generated in same second are equal (not the typical use-case)
        String refreshedToken = new EmailPasswordAuthenticationEndpoint().refreshToken(token, null).getValue();
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
        new EmailPasswordAuthenticationEndpoint().getToken("not@exists.de", "abc", null);
    }

    @Test(expected = UnauthorizedException.class)
    public void testGetTokenIncorrectPwd() throws UnauthorizedException, BadRequestException {
        User unregisteredUser = new User();
        unregisteredUser.setGivenName("given-name");
        unregisteredUser.setSurName("sur-name");
        unregisteredUser.setEmail("email@email.com");
        EmailPasswordAuthenticationEndpoint endpoint = new EmailPasswordAuthenticationEndpoint();

        String password = "password";
        User registeredUser = registerUser(unregisteredUser, password);
        endpoint.getToken(registeredUser.getEmail(), "abc", null); // wrong pwd
    }

    @Test(expected = UnauthorizedException.class)
    public void testRefreshTokenInvalidToken() throws UnauthorizedException {

        User unregisteredUser = new User();
        unregisteredUser.setGivenName("given-name");
        unregisteredUser.setSurName("sur-name");
        unregisteredUser.setEmail("email@email.com");

        String refreshedToken = new EmailPasswordAuthenticationEndpoint().refreshToken("sdfjklsjeiljfs", null).getValue();
    }



    private User registerUser(User unregisteredUser, String password) throws UnauthorizedException, BadRequestException {
        return new EmailPasswordAuthenticationEndpoint().registerEmailPassword(unregisteredUser.getEmail(), password,
                unregisteredUser.getGivenName(), unregisteredUser.getSurName(), null);
    }
}
