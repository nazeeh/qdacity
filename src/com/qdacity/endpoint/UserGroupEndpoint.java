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

import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import javax.jdo.Transaction;
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
    @ApiMethod(name="usergroup.getOwnedUserGroupsByUserId")
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



    private static PersistenceManager getPersistenceManager() {
        return PMF.get().getPersistenceManager();
    }
}
