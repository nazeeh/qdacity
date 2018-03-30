package com.qdacity.endpoint;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.config.Named;
import com.google.api.server.spi.response.BadRequestException;
import com.google.api.server.spi.response.UnauthorizedException;
import com.qdacity.Cache;
import com.qdacity.Constants;
import com.qdacity.PMF;
import com.qdacity.authentication.AuthenticatedUser;
import com.qdacity.authentication.QdacityAuthenticator;
import com.qdacity.user.User;
import com.qdacity.user.UserGroup;

import javax.jdo.PersistenceManager;
import javax.jdo.Transaction;
import java.util.ArrayList;
import java.util.Arrays;

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



    private static PersistenceManager getPersistenceManager() {
        return PMF.get().getPersistenceManager();
    }
}
