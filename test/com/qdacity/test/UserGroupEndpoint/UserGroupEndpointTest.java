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
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;

import java.util.Collection;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class UserGroupEndpointTest {
    private final LocalTaskQueueTestConfig.TaskCountDownLatch latch = new LocalTaskQueueTestConfig.TaskCountDownLatch(1);

    private final LocalServiceTestHelper helper = new LocalServiceTestHelper(new LocalDatastoreServiceTestConfig(), new LocalTaskQueueTestConfig().setQueueXmlPath("war/WEB-INF/queue.xml").setDisableAutoTaskExecution(false).setCallbackClass(LocalTaskQueueTestConfig.DeferredTaskCallback.class).setTaskExecutionLatch(latch));
    private final com.google.api.server.spi.auth.common.User testUser = new AuthenticatedUser("123456", "asd@asd.de", LoginProviderType.GOOGLE);

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

    @Test
    public void testInsertUserGroupNotLoggedIn() throws UnauthorizedException, BadRequestException {
        String groupName = "groupName";
        thrown.expect(UnauthorizedException.class);
        thrown.expectMessage("The user could not be authenticated");
        UserGroup userGroup = new UserGroupEndpoint().insertUserGroup(groupName, null);
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
    public void testUpdateUserGroupName() throws UnauthorizedException, BadRequestException {
        AuthenticatedUser authUser = new AuthenticatedUser("283791", "test@googleuser.de", LoginProviderType.EMAIL_PASSWORD);
        User user = UserEndpointTestHelper.addUser("test@user.de", "test", "user", authUser);

        String groupName = "groupName";
        UserGroup userGroup = new UserGroupEndpoint().insertUserGroup("old", authUser);
        userGroup = new UserGroupEndpoint().updateUserGroupName(userGroup.getId(), groupName, authUser);

        assertEquals(groupName, userGroup.getName());
    }

    @Test
    public void testUpdateUserGroupNameNotLoggedIn() throws UnauthorizedException, BadRequestException {
        AuthenticatedUser authUser = new AuthenticatedUser("283791", "test@googleuser.de", LoginProviderType.EMAIL_PASSWORD);
        User user = UserEndpointTestHelper.addUser("test@user.de", "test", "user", authUser);

        String groupName = "groupName";
        UserGroup userGroup = new UserGroupEndpoint().insertUserGroup("old", authUser);

        thrown.expect(UnauthorizedException.class);
        thrown.expectMessage("The user could not be authenticated");
        userGroup = new UserGroupEndpoint().updateUserGroupName(userGroup.getId(), groupName, null);
    }

    @Test
    public void testUpdateUserGroupNameNull() throws UnauthorizedException, BadRequestException {
        AuthenticatedUser authUser = new AuthenticatedUser("283791", "test@googleuser.de", LoginProviderType.EMAIL_PASSWORD);
        User user = UserEndpointTestHelper.addUser("test@user.de", "test", "user", authUser);

        UserGroup userGroup = new UserGroupEndpoint().insertUserGroup("name", authUser);
        thrown.expect(BadRequestException.class);
        thrown.expectMessage("The name must not be null or empty!");
        userGroup = new UserGroupEndpoint().updateUserGroupName(userGroup.getId(), null, authUser);
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
    public void testListOwnedUserGroupNotLoggedIn() throws UnauthorizedException, BadRequestException {
        AuthenticatedUser authUser = new AuthenticatedUser("283791", "test@googleuser.de", LoginProviderType.EMAIL_PASSWORD);
        User user = UserEndpointTestHelper.addUser("test@user.de", "test", "user", authUser);

        thrown.expect(UnauthorizedException.class);
        thrown.expectMessage("The user could not be authenticated");
        Collection<UserGroup> userGroups = new UserGroupEndpoint().listOwnedUserGroups(null, user.getId(), null).getItems();
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
    public void testListUserGroupsNotLoggedIn() throws UnauthorizedException {
        AuthenticatedUser authUser = new AuthenticatedUser("283791", "test@googleuser.de", LoginProviderType.EMAIL_PASSWORD);
        User user = UserEndpointTestHelper.addUser("test@user.de", "test", "user", authUser);

        thrown.expect(UnauthorizedException.class);
        thrown.expectMessage("The user could not be authenticated");
        Collection<UserGroup> userGroups = new UserGroupEndpoint().listUserGroups(null, user.getId(), null).getItems();
    }

    @Test
    public void testGetUserGroupByIdNotExists() throws UnauthorizedException, BadRequestException {
        AuthenticatedUser authUser = new AuthenticatedUser("283791", "test@googleuser.de", LoginProviderType.EMAIL_PASSWORD);
        User user = UserEndpointTestHelper.addUser("test@user.de", "test", "user", authUser);

        thrown.expect(BadRequestException.class);
        long groupId = 55555555L;
        thrown.expectMessage("The user group with " + groupId + " does not exist!");
        UserGroup userGroup = new UserGroupEndpoint().getUserGroupById(groupId, authUser);
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

        new UserGroupEndpoint().inviteParticipant(participant.getId(), group1.getId(), authGroupOwner);
        new UserGroupEndpoint().confirmParticipantInvitation(group1.getId(), authParticipant);

        group1 = new UserGroupEndpoint().getUserGroupById(group1.getId(), authGroupOwner);
        assertEquals(1, group1.getParticipants().size());
        assertTrue(group1.getParticipants().contains(participant.getId()));

        participant = new UserEndpoint().getCurrentUser(authParticipant);
        assertEquals(1, participant.getUserGroups().size());
        assertTrue(participant.getUserGroups().contains(group1.getId()));
    }

    @Test
    public void testAddParticipantByEmail() throws UnauthorizedException, BadRequestException {
        AuthenticatedUser authGroupOwner = new AuthenticatedUser("283791", "test@googleuser.de", LoginProviderType.EMAIL_PASSWORD);
        User groupOwner = UserEndpointTestHelper.addUser("test@user.de", "test", "user", authGroupOwner);

        AuthenticatedUser authParticipant = new AuthenticatedUser("11", "test2@googleuser.de", LoginProviderType.GOOGLE);
        User participant = UserEndpointTestHelper.addUser("test2@user.de", "test2", "participant", authParticipant);
        assertEquals(0, participant.getUserGroups().size());

        UserGroup group1 = new UserGroupEndpoint().insertUserGroup("group1", authGroupOwner);
        assertEquals(0, group1.getParticipants().size());

        new UserGroupEndpoint().inviteParticipantByEmail(participant.getEmail(), group1.getId(), authGroupOwner);
        new UserGroupEndpoint().confirmParticipantInvitation(group1.getId(), authParticipant);

        group1 = new UserGroupEndpoint().getUserGroupById(group1.getId(), authGroupOwner);
        assertEquals(1, group1.getParticipants().size());
        assertTrue(group1.getParticipants().contains(participant.getId()));

        participant = new UserEndpoint().getCurrentUser(authParticipant);
        assertEquals(1, participant.getUserGroups().size());
        assertTrue(participant.getUserGroups().contains(group1.getId()));
    }

    @Test
    public void testAddParticipantUnauthorized() throws UnauthorizedException, BadRequestException {
        AuthenticatedUser authUser1 = new AuthenticatedUser("283791", "test@googleuser.de", LoginProviderType.EMAIL_PASSWORD);
        User user1 = UserEndpointTestHelper.addUser("test@user.de", "test", "user", authUser1);

        AuthenticatedUser authUser2 = new AuthenticatedUser("11", "test2@googleuser.de", LoginProviderType.GOOGLE);
        User user2 = UserEndpointTestHelper.addUser("test2@user.de", "test2", "user2", authUser2);

        UserGroup group1 = new UserGroupEndpoint().insertUserGroup("group1", authUser1);
        assertEquals(0, group1.getParticipants().size());

        thrown.expect(UnauthorizedException.class);
        thrown.expectMessage("Only group owners and admins are allowed to perform this operation!");
        new UserGroupEndpoint().inviteParticipant(user2.getId(), group1.getId(), authUser2);
    }

    @Test
    public void testAddParticipantNotLoggedIn() throws UnauthorizedException, BadRequestException {
        AuthenticatedUser authUser1 = new AuthenticatedUser("283791", "test@googleuser.de", LoginProviderType.EMAIL_PASSWORD);
        User user1 = UserEndpointTestHelper.addUser("test@user.de", "test", "user", authUser1);

        UserGroup group1 = new UserGroupEndpoint().insertUserGroup("group1", authUser1);
        assertEquals(0, group1.getParticipants().size());

        thrown.expect(UnauthorizedException.class);
        thrown.expectMessage("The user could not be authenticated");
        new UserGroupEndpoint().inviteParticipant(user1.getId(), group1.getId(), null);
    }

    @Test
    public void testAddParticipantByEmailNotExists() throws UnauthorizedException, BadRequestException {
        AuthenticatedUser authGroupOwner = new AuthenticatedUser("283791", "test@googleuser.de", LoginProviderType.EMAIL_PASSWORD);
        User groupOwner = UserEndpointTestHelper.addUser("test@user.de", "test", "user", authGroupOwner);

        UserGroup group1 = new UserGroupEndpoint().insertUserGroup("group1", authGroupOwner);
        assertEquals(0, group1.getParticipants().size());

        String testEmailNotExists = "not@exists.de";

        thrown.expect(BadRequestException.class);
        thrown.expectMessage("User with email " + testEmailNotExists + " not found!");
        new UserGroupEndpoint().inviteParticipantByEmail(testEmailNotExists, group1.getId(), authGroupOwner);
    }

    @Test
    public void testRemoveUserNotLoggedIn() throws UnauthorizedException, BadRequestException {
        AuthenticatedUser authUser1 = new AuthenticatedUser("283791", "test@googleuser.de", LoginProviderType.EMAIL_PASSWORD);
        User user1 = UserEndpointTestHelper.addUser("test@user.de", "test", "user", authUser1);

        UserGroup group1 = new UserGroupEndpoint().insertUserGroup("group1", authUser1);
        new UserGroupEndpoint().inviteParticipant(user1.getId(), group1.getId(), authUser1);
        new UserGroupEndpoint().confirmParticipantInvitation(group1.getId(), authUser1);

        thrown.expect(UnauthorizedException.class);
        thrown.expectMessage("The user could not be authenticated");
        new UserGroupEndpoint().removeUser(user1.getId(), group1.getId(), null);
    }

    @Test
    public void testRemoveUserParticipantByOwner() throws UnauthorizedException, BadRequestException {
        AuthenticatedUser authUser1 = new AuthenticatedUser("283791", "test@googleuser.de", LoginProviderType.EMAIL_PASSWORD);
        User user1 = UserEndpointTestHelper.addUser("test@user.de", "test", "user", authUser1);

        AuthenticatedUser authUser2 = new AuthenticatedUser("11", "test2@googleuser.de", LoginProviderType.GOOGLE);
        User user2 = UserEndpointTestHelper.addUser("test2@user.de", "test2", "user2", authUser2);

        UserGroup group1 = new UserGroupEndpoint().insertUserGroup("group1", authUser1);
        new UserGroupEndpoint().inviteParticipant(user2.getId(), group1.getId(), authUser1);
        new UserGroupEndpoint().confirmParticipantInvitation(group1.getId(), authUser2);

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
        new UserGroupEndpoint().inviteParticipant(user2.getId(), group1.getId(), authUser1);
		new UserGroupEndpoint().confirmParticipantInvitation(group1.getId(), authUser2);

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
        new UserGroupEndpoint().inviteParticipant(user2.getId(), group1.getId(), authUser1);
		new UserGroupEndpoint().confirmParticipantInvitation(group1.getId(), authUser2);

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
        new UserGroupEndpoint().inviteParticipant(user1.getId(), group2.getId(), authUser2);
		new UserGroupEndpoint().confirmParticipantInvitation(group2.getId(), authUser1);

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
        new UserGroupEndpoint().inviteParticipant(user2.getId(), group1.getId(), authUser1);
		new UserGroupEndpoint().confirmParticipantInvitation(group1.getId(), authUser2);

        Collection<User> users = new UserGroupEndpoint().getUsers(null, group1.getId(), authUser1).getItems();
        assertEquals(1, users.stream().filter(user -> user.getId().equals(user1.getId())).count());
        assertEquals(1, users.stream().filter(user -> user.getId().equals(user2.getId())).count());
    }

    @Test
    public void testGetUsersNotLoggedIn() throws UnauthorizedException, BadRequestException {
        AuthenticatedUser authUser1 = new AuthenticatedUser("283791", "test@googleuser.de", LoginProviderType.EMAIL_PASSWORD);
        User user1 = UserEndpointTestHelper.addUser("test@user.de", "test", "user", authUser1);

        UserGroup group1 = new UserGroupEndpoint().insertUserGroup("group1", authUser1);
        new UserGroupEndpoint().inviteParticipant(user1.getId(), group1.getId(), authUser1);

        thrown.expect(UnauthorizedException.class);
        thrown.expectMessage("The user could not be authenticated");
        Collection<User> users = new UserGroupEndpoint().getUsers(null, group1.getId(), null).getItems();
    }
}
