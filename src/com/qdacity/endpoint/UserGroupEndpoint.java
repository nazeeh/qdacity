package com.qdacity.endpoint;

import com.google.api.server.spi.config.*;
import com.google.api.server.spi.response.BadRequestException;
import com.google.api.server.spi.response.CollectionResponse;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.common.collect.Lists;
import com.qdacity.Authorization;
import com.qdacity.Cache;
import com.qdacity.Constants;
import com.qdacity.PMF;
import com.qdacity.authentication.AuthenticatedUser;
import com.qdacity.authentication.QdacityAuthenticator;
import com.qdacity.user.User;
import com.qdacity.user.UserGroup;

import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import java.util.ArrayList;
import java.util.Arrays;
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
     * Adds the user with the given userId to the participants list.
     * Updates the bidirectional relation to user.
     * Only admins and course owner can trigger this endpoint.
     * @param userId
     * @param groupId
     * @param loggedInUser
     * @throws UnauthorizedException
     */
    @ApiMethod(name = "usergroup.addParticipant")
    public void addParticipant(@Named("userId") String userId, @Named("groupId") Long groupId, com.google.api.server.spi.auth.common.User loggedInUser) throws UnauthorizedException {
        if(loggedInUser == null) {
            throw new UnauthorizedException("The participant could not be authenticated");
        }
        User participant = (User) Cache.getOrLoad(userId, User.class);
        UserGroup userGroup = (UserGroup) Cache.getOrLoad(groupId, UserGroup.class);

        Authorization.checkAuthorization(userGroup, loggedInUser); // only owners and admins

        PersistenceManager mgr = getPersistenceManager();
        try {
            userGroup.getParticipants().add(participant.getId());
            mgr.makePersistent(userGroup);
            Cache.cache(userGroup.getId(), UserGroup.class, userGroup);

            participant.getUserGroups().add(userGroup.getId());
            mgr.makePersistent(participant);
            Cache.cache(participant.getId(), User.class, participant);
            Cache.invalidatUserLogins(participant); // for case that admin triggers
        } finally {
            mgr.close();
        }
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
            throw new UnauthorizedException("The participant could not be authenticated");
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


    private static PersistenceManager getPersistenceManager() {
        return PMF.get().getPersistenceManager();
    }
}
