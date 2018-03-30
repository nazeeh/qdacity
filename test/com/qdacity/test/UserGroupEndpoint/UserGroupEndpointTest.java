package com.qdacity.test.UserGroupEndpoint;

import com.google.api.server.spi.response.BadRequestException;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
import com.google.appengine.tools.development.testing.LocalTaskQueueTestConfig;
import com.qdacity.authentication.AuthenticatedUser;
import com.qdacity.endpoint.UserEndpoint;
import com.qdacity.endpoint.UserGroupEndpoint;
import com.qdacity.test.UserEndpoint.UserEndpointTestHelper;
import com.qdacity.user.LoginProviderType;
import com.qdacity.user.User;
import com.qdacity.user.UserGroup;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import java.util.Collection;
import java.util.List;

import static org.junit.Assert.assertEquals;

public class UserGroupEndpointTest {
    private final LocalTaskQueueTestConfig.TaskCountDownLatch latch = new LocalTaskQueueTestConfig.TaskCountDownLatch(1);

    private final LocalServiceTestHelper helper = new LocalServiceTestHelper(new LocalDatastoreServiceTestConfig(), new LocalTaskQueueTestConfig().setQueueXmlPath("war/WEB-INF/queue.xml").setDisableAutoTaskExecution(false).setCallbackClass(LocalTaskQueueTestConfig.DeferredTaskCallback.class).setTaskExecutionLatch(latch));
    private final com.google.api.server.spi.auth.common.User testUser = new AuthenticatedUser("123456", "asd@asd.de", LoginProviderType.GOOGLE);

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
    public void testInsertUserGroup() throws UnauthorizedException, BadRequestException {
        AuthenticatedUser authUser = new AuthenticatedUser("283791", "test@googleuser.de", LoginProviderType.EMAIL_PASSWORD);
        User user = UserEndpointTestHelper.addUser("test@user.de", "test", "user", authUser);

        assertEquals(0, user.getUserGroups().size());

        String groupName = "groupName";
        UserGroup userGroup = new UserGroupEndpoint().insertUserGroup(groupName, authUser);

        assertEquals(groupName, userGroup.getName());
        assertEquals(1, userGroup.getOwners().size());
        assertEquals(0, userGroup.getParticipants().size());
        assertEquals(user.getId(), userGroup.getOwners().get(0));

        User updatedUser = new UserEndpoint().getCurrentUser(authUser);
        assertEquals(1, updatedUser.getUserGroups().size());
        assertEquals(userGroup.getId(), updatedUser.getUserGroups().get(0));
    }

    @Test(expected = BadRequestException.class)
    public void testInsertUserGroupNameNull() throws UnauthorizedException, BadRequestException {
        AuthenticatedUser authUser = new AuthenticatedUser("283791", "test@googleuser.de", LoginProviderType.EMAIL_PASSWORD);
        User user = UserEndpointTestHelper.addUser("test@user.de", "test", "user", authUser);

        assertEquals(0, user.getUserGroups().size());

        String groupName = null;
        new UserGroupEndpoint().insertUserGroup(groupName, authUser);
    }

    @Test
    public void testListOwnedUserGroup() throws UnauthorizedException, BadRequestException {
        AuthenticatedUser authUser = new AuthenticatedUser("283791", "test@googleuser.de", LoginProviderType.EMAIL_PASSWORD);
        User user = UserEndpointTestHelper.addUser("test@user.de", "test", "user", authUser);
        assertEquals(0, user.getUserGroups().size());

        UserGroup group1 = new UserGroupEndpoint().insertUserGroup("group1", authUser);
        UserGroup group2 = new UserGroupEndpoint().insertUserGroup("group2", authUser);

        Collection<UserGroup> userGroups = new UserGroupEndpoint().listOwnedUserGroups(null, user.getId(), authUser).getItems();
        assertEquals(2, userGroups.size());
        assertEquals(1, userGroups.stream().filter(group -> group.getId().equals(group1.getId())).count());
        assertEquals(1, userGroups.stream().filter(group -> group.getId().equals(group2.getId())).count());
    }

    @Test
    public void testListOwnedUserGroupNoId() throws UnauthorizedException, BadRequestException {
        AuthenticatedUser authUser = new AuthenticatedUser("283791", "test@googleuser.de", LoginProviderType.EMAIL_PASSWORD);
        User user = UserEndpointTestHelper.addUser("test@user.de", "test", "user", authUser);
        assertEquals(0, user.getUserGroups().size());

        UserGroup group1 = new UserGroupEndpoint().insertUserGroup("group1", authUser);
        UserGroup group2 = new UserGroupEndpoint().insertUserGroup("group2", authUser);

        Collection<UserGroup> userGroups = new UserGroupEndpoint().listOwnedUserGroups(null, null, authUser).getItems();
        assertEquals(2, userGroups.size());
        assertEquals(1, userGroups.stream().filter(group -> group.getId().equals(group1.getId())).count());
        assertEquals(1, userGroups.stream().filter(group -> group.getId().equals(group2.getId())).count());
    }
}
