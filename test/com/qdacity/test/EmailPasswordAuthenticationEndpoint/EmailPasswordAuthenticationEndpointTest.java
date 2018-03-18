package com.qdacity.test.EmailPasswordAuthenticationEndpoint;

import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
import com.google.appengine.tools.development.testing.LocalTaskQueueTestConfig;
import com.qdacity.authentication.AuthenticatedUser;
import com.qdacity.endpoint.EmailPasswordAuthenticationEndpoint;
import com.qdacity.endpoint.UserEndpoint;
import com.qdacity.user.LoginProviderType;
import com.qdacity.user.User;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

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
    public void testRegister() throws UnauthorizedException {
        User unregisteredUser = new User();
        unregisteredUser.setGivenName("given-name");
        unregisteredUser.setSurName("sur-name");
        unregisteredUser.setEmail("email@email.com");
        EmailPasswordAuthenticationEndpoint endpoint = new EmailPasswordAuthenticationEndpoint();

        User registeredUser = endpoint.registerEmailPassword(unregisteredUser, "password", null);

        AuthenticatedUser authenticatedUser = new AuthenticatedUser(
                registeredUser.getLoginProviderInformation().get(0).getExternalUserId(),
                registeredUser.getEmail(), LoginProviderType.EMAIL_PASSWORD);

        UserEndpoint ue = new UserEndpoint();
        ue.getCurrentUser(authenticatedUser);
    }

    @Test(expected = UnauthorizedException.class)
    public void testRegisterSameEmail() throws UnauthorizedException {
        User unregisteredUser = new User();
        unregisteredUser.setGivenName("given-name");
        unregisteredUser.setSurName("sur-name");
        unregisteredUser.setEmail("email@email.com");
        EmailPasswordAuthenticationEndpoint endpoint = new EmailPasswordAuthenticationEndpoint();

        endpoint.registerEmailPassword(unregisteredUser, "password", null);
        endpoint.registerEmailPassword(unregisteredUser, "password", null);
    }
}
