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

import java.util.ArrayList;
import java.util.Collection;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

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

    @Test
    public void testAddParticipant() throws UnauthorizedException, BadRequestException {
        AuthenticatedUser authGroupOwner = new AuthenticatedUser("283791", "test@googleuser.de", LoginProviderType.EMAIL_PASSWORD);
        User groupOwner = UserEndpointTestHelper.addUser("test@user.de", "test", "user", authGroupOwner);

        AuthenticatedUser authParticipant = new AuthenticatedUser("11", "test2@googleuser.de", LoginProviderType.GOOGLE);
        User participant = UserEndpointTestHelper.addUser("test2@user.de", "test2", "participant", authParticipant);
        assertEquals(0, participant.getUserGroups().size());

        UserGroup group1 = new UserGroupEndpoint().insertUserGroup("group1", authGroupOwner);
        assertEquals(0, group1.getParticipants().size());

        new UserGroupEndpoint().addParticipant(participant.getId(), group1.getId(), authGroupOwner);

        group1 = new UserGroupEndpoint().getUserGroupById(group1.getId(), authGroupOwner);
        assertEquals(1, group1.getParticipants().size());
        assertTrue(group1.getParticipants().contains(participant.getId()));

        participant = new UserEndpoint().getCurrentUser(authParticipant);
        assertEquals(1, participant.getUserGroups().size());
        assertTrue(participant.getUserGroups().contains(group1.getId()));
    }

    @Test(expected = UnauthorizedException.class)
    public void testAddParticipantUnauthorized() throws UnauthorizedException, BadRequestException {
        AuthenticatedUser authUser1 = new AuthenticatedUser("283791", "test@googleuser.de", LoginProviderType.EMAIL_PASSWORD);
        User user1 = UserEndpointTestHelper.addUser("test@user.de", "test", "user", authUser1);

        AuthenticatedUser authUser2 = new AuthenticatedUser("11", "test2@googleuser.de", LoginProviderType.GOOGLE);
        User user2 = UserEndpointTestHelper.addUser("test2@user.de", "test2", "user2", authUser2);

        UserGroup group1 = new UserGroupEndpoint().insertUserGroup("group1", authUser1);
        assertEquals(0, group1.getParticipants().size());

        new UserGroupEndpoint().addParticipant(user2.getId(), group1.getId(), authUser2);
    }

    @Test
    public void testRemoveUserParticipantByOwner() throws UnauthorizedException, BadRequestException {
        AuthenticatedUser authUser1 = new AuthenticatedUser("283791", "test@googleuser.de", LoginProviderType.EMAIL_PASSWORD);
        User user1 = UserEndpointTestHelper.addUser("test@user.de", "test", "user", authUser1);

        AuthenticatedUser authUser2 = new AuthenticatedUser("11", "test2@googleuser.de", LoginProviderType.GOOGLE);
        User user2 = UserEndpointTestHelper.addUser("test2@user.de", "test2", "user2", authUser2);

        UserGroup group1 = new UserGroupEndpoint().insertUserGroup("group1", authUser1);
        new UserGroupEndpoint().addParticipant(user2.getId(), group1.getId(), authUser1);

        Collection<UserGroup> userGroupCollection = new UserGroupEndpoint().listUserGroups(null, null, authUser2).getItems();
        assertEquals(1, userGroupCollection.size());

        new UserGroupEndpoint().removeUser(user2.getId(), group1.getId(), authUser1);
        userGroupCollection = new UserGroupEndpoint().listUserGroups(null, null, authUser2).getItems();
        assertEquals(0, userGroupCollection.size());
    }

    @Test
    public void testRemoveUserParticipantSelf() throws UnauthorizedException, BadRequestException {
        AuthenticatedUser authUser1 = new AuthenticatedUser("283791", "test@googleuser.de", LoginProviderType.EMAIL_PASSWORD);
        User user1 = UserEndpointTestHelper.addUser("test@user.de", "test", "user", authUser1);

        AuthenticatedUser authUser2 = new AuthenticatedUser("11", "test2@googleuser.de", LoginProviderType.GOOGLE);
        User user2 = UserEndpointTestHelper.addUser("test2@user.de", "test2", "user2", authUser2);

        UserGroup group1 = new UserGroupEndpoint().insertUserGroup("group1", authUser1);
        new UserGroupEndpoint().addParticipant(user2.getId(), group1.getId(), authUser1);

        Collection<UserGroup> userGroupCollection = new UserGroupEndpoint().listUserGroups(null, null, authUser2).getItems();
        assertEquals(1, userGroupCollection.size());

        new UserGroupEndpoint().removeUser(user2.getId(), group1.getId(), authUser2);
        userGroupCollection = new UserGroupEndpoint().listUserGroups(null, null, authUser2).getItems();
        assertEquals(0, userGroupCollection.size());
    }

    @Test
    public void testRemoveUserOwner() throws UnauthorizedException, BadRequestException {
        AuthenticatedUser authUser1 = new AuthenticatedUser("283791", "test@googleuser.de", LoginProviderType.EMAIL_PASSWORD);
        User user1 = UserEndpointTestHelper.addUser("test@user.de", "test", "user", authUser1);

        AuthenticatedUser authUser2 = new AuthenticatedUser("11", "test2@googleuser.de", LoginProviderType.GOOGLE);
        User user2 = UserEndpointTestHelper.addUser("test2@user.de", "test2", "user2", authUser2);

        UserGroup group1 = new UserGroupEndpoint().insertUserGroup("group1", authUser1);
        new UserGroupEndpoint().addParticipant(user2.getId(), group1.getId(), authUser1);

        Collection<UserGroup> userGroupCollection = new UserGroupEndpoint().listUserGroups(null, null, authUser1).getItems();
        assertEquals(1, userGroupCollection.size());

        new UserGroupEndpoint().removeUser(user1.getId(), group1.getId(), authUser1);
        userGroupCollection = new UserGroupEndpoint().listUserGroups(null, null, authUser1).getItems();
        assertEquals(0, userGroupCollection.size());
    }

    @Test
    public void testListUserGroups() throws UnauthorizedException, BadRequestException {
        AuthenticatedUser authUser1 = new AuthenticatedUser("283791", "test@googleuser.de", LoginProviderType.EMAIL_PASSWORD);
        User user1 = UserEndpointTestHelper.addUser("test@user.de", "test", "user", authUser1);

        AuthenticatedUser authUser2 = new AuthenticatedUser("11", "test2@googleuser.de", LoginProviderType.GOOGLE);
        User user2 = UserEndpointTestHelper.addUser("test2@user.de", "test2", "participant", authUser2);

        UserGroup group1 = new UserGroupEndpoint().insertUserGroup("group1", authUser1);
        UserGroup group2 = new UserGroupEndpoint().insertUserGroup("group2", authUser2);
        new UserGroupEndpoint().addParticipant(user1.getId(), group2.getId(), authUser2);

        Collection<UserGroup> userGroups = new UserGroupEndpoint().listUserGroups(null, user1.getId(), authUser2).getItems();
        assertEquals(2, userGroups.size());

        assertEquals(1, userGroups.stream().filter(group -> group.getId().equals(group1.getId())).count());
        assertEquals(1, userGroups.stream().filter(group -> group.getId().equals(group2.getId())).count());
    }

    @Test
    public void testGetUsers() throws UnauthorizedException, BadRequestException {
        AuthenticatedUser authUser1 = new AuthenticatedUser("283791", "test@googleuser.de", LoginProviderType.EMAIL_PASSWORD);
        User user1 = UserEndpointTestHelper.addUser("test@user.de", "test", "user", authUser1);

        AuthenticatedUser authUser2 = new AuthenticatedUser("11", "test2@googleuser.de", LoginProviderType.GOOGLE);
        User user2 = UserEndpointTestHelper.addUser("test2@user.de", "test2", "user2", authUser2);

        UserGroup group1 = new UserGroupEndpoint().insertUserGroup("group1", authUser1);
        new UserGroupEndpoint().addParticipant(user2.getId(), group1.getId(), authUser1);

        Collection<User> users = new UserGroupEndpoint().getUsers(null, group1.getId(), authUser1).getItems();
        assertEquals(1, users.stream().filter(user -> user.getId().equals(user1.getId())).count());
        assertEquals(1, users.stream().filter(user -> user.getId().equals(user2.getId())).count());
    }
}