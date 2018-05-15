package com.qdacity.endpoint;

import com.google.api.server.spi.config.*;
import com.google.api.server.spi.response.BadRequestException;
import com.google.api.server.spi.response.CollectionResponse;
import com.google.api.server.spi.response.UnauthorizedException;
import com.qdacity.Authorization;
import com.qdacity.Cache;
import com.qdacity.Constants;
import com.qdacity.PMF;
import com.qdacity.authentication.AuthenticatedUser;
import com.qdacity.authentication.QdacityAuthenticator;
import com.qdacity.user.User;
import com.qdacity.user.UserGroup;
import com.qdacity.user.UserNotification;
import com.qdacity.user.UserNotificationType;

import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

@Api(
        name = "qdacity",
        version = Constants.VERSION,
        namespace = @ApiNamespace(
                ownerDomain = "qdacity.com",
                ownerName = "qdacity.com",
                packagePath = "server.project"),
        authenticators = {QdacityAuthenticator.class}
)
public class UserGroupEndpoint {

    /**
     * Inserts a new user group with the given name and assigns the requesting user as owner.
     * @param name
     * @param loggedInUser
     * @return
     * @throws UnauthorizedException
     * @throws BadRequestException
     */
    @ApiMethod(name = "usergroup.insertUserGroup")
    public UserGroup insertUserGroup(@Named("name") String name, com.google.api.server.spi.auth.common.User loggedInUser) throws UnauthorizedException, BadRequestException {
        if(loggedInUser == null) {
            throw new UnauthorizedException("The user could not be authenticated");
        }
        if(name == null || name.isEmpty()) {
            throw new BadRequestException("The name must not be null or empty!");
        }
        AuthenticatedUser authUser = (AuthenticatedUser) loggedInUser;
        User user = Cache.getOrLoadUserByAuthenticatedUser(authUser);

        UserGroup userGroup = new UserGroup();
        userGroup.setName(name);
        userGroup.setOwners(Arrays.asList(user.getId()));
        userGroup.setParticipants(new ArrayList<String>());
        userGroup.setProjects(new ArrayList<Long>());
        userGroup.setCourses(new ArrayList<Long>());

        PersistenceManager mgr = getPersistenceManager();
        try {
            userGroup = mgr.makePersistent(userGroup);
            Cache.cache(userGroup.getId(), UserGroup.class, userGroup);

            user.getUserGroups().add(userGroup.getId());
            mgr.makePersistent(user);
            Cache.cache(user.getId(), User.class, user);
            Cache.cacheAuthenticatedUser(authUser, user);
        } finally {
            mgr.close();
        }
        return userGroup;
    }

    /**
     * Updates the UserGroup with the given id with the given name.
     * @param groupId
     * @param name
     * @param loggedInUser
     * @return
     * @throws BadRequestException
     * @throws UnauthorizedException
     */
    @ApiMethod(name = "usergroup.updateGroupName")
    public UserGroup updateUserGroupName(@Named("groupId") Long groupId, @Named("name") String name, com.google.api.server.spi.auth.common.User loggedInUser) throws BadRequestException, UnauthorizedException {
        if(loggedInUser == null) {
            throw new UnauthorizedException("The user could not be authenticated");
        }
        if(name == null || name.isEmpty()) {
            throw new BadRequestException("The name must not be null or empty!");
        }

        UserGroup userGroup = (UserGroup) Cache.getOrLoad(groupId, UserGroup.class);

        Authorization.checkAuthorization(userGroup, loggedInUser); // only owners and admins

        userGroup.setName(name);
        PersistenceManager mgr = getPersistenceManager();
        try {
            mgr.makePersistent(userGroup);
            Cache.cache(userGroup.getId(), UserGroup.class, userGroup);
        } finally {
            mgr.close();
        }
        return userGroup;
    }

    /**
     * Lists all owned user groups for the user with the given userId.
     * If the userId is empty, the owned userGroups of the requesting users is returned.
     * @param userId
     * @param loggedInUser
     * @return
     * @throws UnauthorizedException
     */
    @ApiMethod(name="usergroup.listOwnedUserGroups", path = "usergroup.listOwnedUserGroups")
    public CollectionResponse<UserGroup> listOwnedUserGroups(@Named("cursor") @Nullable String cursorString, @Named("userId") @Nullable String userId, com.google.api.server.spi.auth.common.User loggedInUser) throws UnauthorizedException {
        if(loggedInUser == null) {
            throw new UnauthorizedException("The user could not be authenticated");
        }
        AuthenticatedUser authUser = (AuthenticatedUser) loggedInUser;
        User user = Cache.getOrLoadUserByAuthenticatedUser(authUser);

        if(userId == null || userId.isEmpty()) {
            userId = user.getId();
        }

        List<UserGroup> execute = null;
        PersistenceManager mgr = getPersistenceManager();
        try {
            Query q = mgr.newQuery(UserGroup.class, ":p.contains(owners)");
            execute = (List<UserGroup>) q.execute(Arrays.asList(userId));

            // Tight loop for fetching all entities from datastore and accomodate
            // for lazy fetch.
            for (UserGroup obj : execute);
        } finally {
            mgr.close();
        }

        return CollectionResponse.<UserGroup> builder().setItems(execute).setNextPageToken(cursorString).build();
    }

    /**
     * Lists all user groups that the user with the given userId owns or participates.
     * If the userId is empty, the owned userGroups of the requesting users is returned.
     * @param cursorString
     * @param userId
     * @param loggedInUser
     * @return
     */
    @ApiMethod(name = "usergroup.listUserGroups", path = "usergroup.listUserGroups")
    public CollectionResponse<UserGroup> listUserGroups(@Named("cursor") @Nullable String cursorString, @Named("userId") @Nullable String userId, com.google.api.server.spi.auth.common.User loggedInUser) throws UnauthorizedException {
        if(loggedInUser == null) {
            throw new UnauthorizedException("The user could not be authenticated");
        }

        if(userId == null || userId.isEmpty()) {
            AuthenticatedUser authUser = (AuthenticatedUser) loggedInUser;
            User requestingUser = Cache.getOrLoadUserByAuthenticatedUser(authUser);
            userId = requestingUser.getId();
        }
        User user = (User) Cache.getOrLoad(userId, User.class);

        List<UserGroup> execute = new ArrayList<UserGroup>();
        PersistenceManager mgr = getPersistenceManager();
        try {
            for(Long userGroupId: user.getUserGroups()) {
                UserGroup group = (UserGroup) Cache.getOrLoad(userGroupId, UserGroup.class);
                execute.add(group);
            }
        } finally {
            mgr.close();
        }

        return CollectionResponse.<UserGroup> builder().setItems(execute).setNextPageToken(cursorString).build();
    }

    /**
     * Returns the UserGroup by id.
     * @param groupId
     * @param loggedInUser
     * @return
     * @throws UnauthorizedException
     */
    @ApiMethod(name = "usergroup.getById")
    public UserGroup getUserGroupById(@Named("groupId") Long groupId, com.google.api.server.spi.auth.common.User loggedInUser) throws UnauthorizedException, BadRequestException {
        if(loggedInUser == null) {
            throw new UnauthorizedException("The user could not be authenticated");
        }
        User qdacityUser = Cache.getOrLoadUserByAuthenticatedUser((AuthenticatedUser) loggedInUser);

        UserGroup requestedGroup = (UserGroup) Cache.getOrLoad(groupId, UserGroup.class);
        if(requestedGroup == null) {
            throw new BadRequestException("The user group with " + groupId + " does not exist!");
        }

        if(!requestedGroup.getParticipants().contains(qdacityUser.getId())) { // participants allowed
            Authorization.checkAuthorization(requestedGroup, loggedInUser); // admin and owners allowed
        }

        return (UserGroup) Cache.getOrLoad(groupId, UserGroup.class);
    }

    /**
     * Invites the user with the given userId to the participants list.
     * Only admins and course owner can trigger this endpoint.
     * @param userId
     * @param groupId
     * @param loggedInUser
     * @throws UnauthorizedException
     */
    @ApiMethod(name = "usergroup.inviteParticipant")
    public void inviteParticipant(@Named("userId") String userId, @Named("groupId") Long groupId, com.google.api.server.spi.auth.common.User loggedInUser) throws UnauthorizedException {
        if(loggedInUser == null) {
            throw new UnauthorizedException("The user could not be authenticated");
        }
        User participant = (User) Cache.getOrLoad(userId, User.class);
        UserGroup userGroup = (UserGroup) Cache.getOrLoad(groupId, UserGroup.class);

        Authorization.checkAuthorization(userGroup, loggedInUser); // only owners and admins
        User invitingUser = Cache.getOrLoadUserByAuthenticatedUser((AuthenticatedUser) loggedInUser);

        PersistenceManager mgr = getPersistenceManager();
        try {
            userGroup.getInvitedParticipants().add(participant.getId());
            mgr.makePersistent(userGroup);
            Cache.cache(userGroup.getId(), UserGroup.class, userGroup);

            Cache.invalidatUserLogins(participant); // for case that admin triggers

            // Create notification
            UserNotification notification = new UserNotification();
            notification.setDatetime(new Date());
            notification.setMessage("UserGroup: " + userGroup.getName());
            notification.setSubject("Invitation by <b>" + invitingUser.getGivenName() + " " + invitingUser.getSurName() + "</b>");
            notification.setOriginUser(invitingUser.getId());
            notification.setUserGroupId(groupId);
            notification.setSettled(false);
            notification.setType(UserNotificationType.INVITATION_GROUP);
            notification.setUser(userId);

            mgr.makePersistent(notification);
        } finally {
            mgr.close();
        }
    }

    /**
     * Confirms the invite to the group.
     * @param groupId
     * @param loggedInUser
     * @throws UnauthorizedException
     * @throws BadRequestException
     */
    @ApiMethod(name = "usergroup.acceptParticipantInvitation")
    public void confirmParticipantInvitation(@Named("groupId") Long groupId, com.google.api.server.spi.auth.common.User loggedInUser) throws UnauthorizedException, BadRequestException {
        if(loggedInUser == null) {
            throw new UnauthorizedException("The user could not be authenticated");
        }
        User confirmingUser = Cache.getOrLoadUserByAuthenticatedUser((AuthenticatedUser) loggedInUser);
        UserGroup userGroup = (UserGroup) Cache.getOrLoad(groupId, UserGroup.class);

        if(userGroup == null) throw new BadRequestException("The user group with id " + groupId + " was not found!");

        // Authorization: only if invited
        if(!userGroup.getInvitedParticipants().contains(confirmingUser.getId())) {
            throw new BadRequestException("The user requesting user is not invited!");
        }

        PersistenceManager mgr = getPersistenceManager();
        try {
            userGroup.getParticipants().add(confirmingUser.getId());
            mgr.makePersistent(userGroup);
            Cache.cache(userGroup.getId(), UserGroup.class, userGroup);

            confirmingUser.getUserGroups().add(userGroup.getId());
            mgr.makePersistent(confirmingUser);
            Cache.cache(confirmingUser.getId(), User.class, confirmingUser);
        } finally {
            mgr.close();
        }
    }

    /**
     * Invites the user with the given userEmail to the participants list.
     * Only admins and course owner can trigger this endpoint.
     * @param userEmail
     * @param groupId
     * @param loggedInUser
     * @throws UnauthorizedException
     */
    @ApiMethod(name = "usergroup.inviteParticipantByEmail")
    public void inviteParticipantByEmail(@Named("userEmail") String userEmail, @Named("groupId") Long groupId, com.google.api.server.spi.auth.common.User loggedInUser) throws UnauthorizedException, BadRequestException {
        String userID = null;

        PersistenceManager mgr = getPersistenceManager();
        try {
            // Get the invited user
            Query q = mgr.newQuery(com.qdacity.user.User.class, "email == '" + userEmail + "'");
            @SuppressWarnings("unchecked")
            List<com.qdacity.user.User> dbUsers = (List<com.qdacity.user.User>) q.execute();

            if(dbUsers.size() == 0) {
                throw new BadRequestException("User with email " + userEmail + " not found!");
            }
            userID = dbUsers.get(0).getId();
        } finally {
            mgr.close();
        }

        this.inviteParticipant(userID, groupId, loggedInUser);
    }


    /**
     * Removes the given user from the given group (owner and participant).
     * Updates the bidirectional relation to user.
     * Only admins and course owner can trigger this endpoint to remove other users.
     * Participants can remove themselves.
     * @param userId
     * @param groupId
     * @param loggedInUser
     * @throws UnauthorizedException
     */
    @ApiMethod(name = "usergroup.removeUser", path = "usergroup.removeUser")
    public void removeUser(@Named("userId") String userId, @Named("groupId") Long groupId, com.google.api.server.spi.auth.common.User loggedInUser) throws UnauthorizedException {
        if(loggedInUser == null) {
            throw new UnauthorizedException("The user could not be authenticated");
        }
        User requestingUser = Cache.getOrLoadUserByAuthenticatedUser((AuthenticatedUser) loggedInUser);
        User user = (User) Cache.getOrLoad(userId, User.class);
        UserGroup userGroup = (UserGroup) Cache.getOrLoad(groupId, UserGroup.class);

        if(!requestingUser.getId().equals(userId)) { // removin self is ok
            Authorization.checkAuthorization(userGroup, loggedInUser); // otherwise only owners and admins
        }

        PersistenceManager mgr = getPersistenceManager();
        try {
            userGroup.getParticipants().remove(user.getId());
            userGroup.getOwners().remove(user.getId());
            mgr.makePersistent(userGroup);
            Cache.cache(userGroup.getId(), UserGroup.class, userGroup);

            user.getUserGroups().remove(userGroup.getId());
            mgr.makePersistent(user);
            Cache.cache(user.getId(), User.class, user);
            Cache.invalidatUserLogins(user); // for case that admin triggers
        } finally {
            mgr.close();
        }
    }

    /**
     * Returns all users that are associeted with the given user group.
     * @param cursorString
     * @param groupId
     * @param loggedInUser
     * @return
     * @throws UnauthorizedException
     */
    @ApiMethod(name = "usergroup.getUsers", path = "usergroup.getUsers")
    public CollectionResponse<User> getUsers(@Named("cursor") @Nullable String cursorString, @Named("groupId") Long groupId, com.google.api.server.spi.auth.common.User loggedInUser) throws UnauthorizedException {
        if(loggedInUser == null) {
            throw new UnauthorizedException("The user could not be authenticated");
        }

        User qdacityUser = Cache.getOrLoadUserByAuthenticatedUser((AuthenticatedUser) loggedInUser);
        UserGroup requestedGroup = (UserGroup) Cache.getOrLoad(groupId, UserGroup.class);
            if(!requestedGroup.getParticipants().contains(qdacityUser.getId())) { // participants allowed
            Authorization.checkAuthorization(requestedGroup, loggedInUser); // admin and owners allowed
        }

        List<User> execute = null;
        PersistenceManager mgr = getPersistenceManager();
        try {
            Query q = mgr.newQuery(User.class, ":p.contains(userGroups)");
            execute = (List<User>) q.execute(Arrays.asList(groupId));

            // Tight loop for fetching all entities from datastore and accomodate
            // for lazy fetch.
            for (User obj : execute);
        } finally {
            mgr.close();
        }

        return CollectionResponse.<User> builder().setItems(execute).setNextPageToken(cursorString).build();
    }


    private static PersistenceManager getPersistenceManager() {
        return PMF.get().getPersistenceManager();
    }
}
