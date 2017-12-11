package com.qdacity.test.UserMigrationEndpoint;

import static org.junit.Assert.fail;

import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;

import com.google.api.server.spi.response.ConflictException;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
import com.google.appengine.tools.development.testing.LocalTaskQueueTestConfig;
import com.qdacity.authentication.AuthenticatedUser;
import com.qdacity.endpoint.UserEndpoint;
import com.qdacity.endpoint.UserMigrationEndpoint;
import com.qdacity.test.UserEndpoint.UserEndpointTestHelper;
import com.qdacity.user.LoginProviderType;
import com.qdacity.user.User;
import com.qdacity.user.UserLoginProviderInformation;

public class UserMigrationEndpointTest {
	
	private final LocalTaskQueueTestConfig.TaskCountDownLatch latch = new LocalTaskQueueTestConfig.TaskCountDownLatch(1);
	private final LocalServiceTestHelper helper = new LocalServiceTestHelper(new LocalDatastoreServiceTestConfig(), new LocalTaskQueueTestConfig().setQueueXmlPath("war/WEB-INF/queue.xml").setDisableAutoTaskExecution(false).setCallbackClass(LocalTaskQueueTestConfig.DeferredTaskCallback.class).setTaskExecutionLatch(latch));
	
	private final UserMigrationEndpoint endpoint = new UserMigrationEndpoint();
	private final AuthenticatedUser newUser = new AuthenticatedUser("1234567", "Max@Mustermann.de", LoginProviderType.GOOGLE);
	private final com.google.appengine.api.users.User oldUser = new com.google.appengine.api.users.User("Max@Mustermann.de", "gmail.com", "12345");
	

	@Before
	public void setUp() {
		helper.setUp();
	}

	@After
	public void tearDown() {
		latch.reset();
		helper.tearDown();
	}
	
	@Test(expected = UnauthorizedException.class)
	public void migrationNoOldUser() throws UnauthorizedException, ConflictException {
		endpoint.doMigrateFromGoogleIdentityToCustomAuthentication(oldUser, newUser);
	}

	@Test(expected = ConflictException.class)
	public void migrationNewUserExists() throws UnauthorizedException, ConflictException {
		UserMigrationEndpointTestHelper.insertOldUser(oldUser.getUserId(), oldUser.getEmail());
		UserEndpointTestHelper.addUser("test@test.de", "Hans", "Wurst", newUser);
		
		endpoint.doMigrateFromGoogleIdentityToCustomAuthentication(oldUser, newUser);
	}
	
	@Test
	public void migrationWorks() throws UnauthorizedException, ConflictException {
		User userDBbefore = UserMigrationEndpointTestHelper.insertOldUser(oldUser.getUserId(), oldUser.getEmail());
		
		endpoint.doMigrateFromGoogleIdentityToCustomAuthentication(oldUser, newUser);
		
		// there must be information in UserLoginProviderInformation
		UserEndpoint userEndpoint = new UserEndpoint();
		User userDBafter = userEndpoint.getCurrentUser(newUser);
		Assert.assertEquals(1, userDBafter.getLoginProviderInformation().size());
		
		// information for new useri n UserLoginProviderInformation
		UserLoginProviderInformation loginInfo = userDBafter.getLoginProviderInformation().get(0);
		Assert.assertEquals(newUser.getProvider(), loginInfo.getProvider());
		Assert.assertEquals(newUser.getId(), loginInfo.getExternalUserId());
		
		// userId must have stayed the same!
		Assert.assertEquals(userDBbefore.getId(), userDBafter.getId());
	}
	
	@Test(expected = ConflictException.class)
	public void migrationAlreadyMigrated() throws UnauthorizedException, ConflictException {
		UserMigrationEndpointTestHelper.insertOldUser(oldUser.getUserId(), oldUser.getEmail());
		try {
			endpoint.doMigrateFromGoogleIdentityToCustomAuthentication(oldUser, newUser);
		} catch(UnauthorizedException | ConflictException ex) {
			fail("First run of migration should work!");
		}

		endpoint.doMigrateFromGoogleIdentityToCustomAuthentication(oldUser, newUser);
	}
}
