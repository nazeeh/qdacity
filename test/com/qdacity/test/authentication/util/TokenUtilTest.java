package com.qdacity.test.authentication.util;

import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
import com.google.appengine.tools.development.testing.LocalTaskQueueTestConfig;
import com.qdacity.Cache;
import com.qdacity.PMF;
import com.qdacity.authentication.AuthenticatedUser;
import com.qdacity.authentication.StoredSecret;
import com.qdacity.authentication.util.TokenUtil;
import com.qdacity.user.LoginProviderType;
import com.qdacity.user.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.impl.crypto.RsaProvider;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import javax.crypto.BadPaddingException;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.jdo.PersistenceManager;
import java.lang.reflect.Field;
import java.security.InvalidKeyException;
import java.security.KeyPair;
import java.security.NoSuchAlgorithmException;
import java.security.PublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.GregorianCalendar;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class TokenUtilTest {

    private final LocalTaskQueueTestConfig.TaskCountDownLatch latch = new LocalTaskQueueTestConfig.TaskCountDownLatch(1);
    private final LocalServiceTestHelper helper = new LocalServiceTestHelper(new LocalDatastoreServiceTestConfig(), new LocalTaskQueueTestConfig().setQueueXmlPath("war/WEB-INF/queue.xml").setDisableAutoTaskExecution(false).setCallbackClass(LocalTaskQueueTestConfig.DeferredTaskCallback.class).setTaskExecutionLatch(latch));

    @Before
    public void setUp() throws IllegalAccessException, NoSuchFieldException {
        helper.setUp();

        // reset Singleton
        Field instance = TokenUtil.class.getDeclaredField("instance");
        instance.setAccessible(true);
        instance.set(null, null);
    }

    @After
    public void tearDown() {
        latch.reset(1);
        helper.tearDown();
    }

    @Test
    public void testGeneratedClaims() {
        User user = new User();
        user.setId("123");
        user.setEmail("test@test.de");
        user.setSurName("lastname");
        user.setGivenName("firstname");

        AuthenticatedUser authUser = new AuthenticatedUser("456", "test@test2.de", LoginProviderType.EMAIL_PASSWORD);

        String token = TokenUtil.getInstance().genToken(user, authUser);

        Claims claims = Jwts.parser().setSigningKey(TokenUtil.getInstance().getPublicKey()).parseClaimsJws(token).getBody();

        assertEquals(TokenUtil.JWT_ISSUER, claims.getIssuer());
        assertEquals(user.getId(), claims.getSubject());
        assertEquals(user.getGivenName() + " " + user.getSurName(), claims.get(TokenUtil.NAME_CLAIM, String.class));
        assertEquals(user.getGivenName(), claims.get(TokenUtil.FIRSTNAME_CLAIM, String.class));
        assertEquals(user.getSurName(), claims.get(TokenUtil.LASTNAME_CLAIM, String.class));
        assertEquals(user.getEmail(), claims.get(TokenUtil.EMAIL_CLAIM, String.class));

        assertEquals(authUser.getId(), claims.get(TokenUtil.EXTERNAL_USER_ID_CLAIM, String.class));
        assertEquals(authUser.getProvider().toString(), claims.get(TokenUtil.AUTH_NETWORK_CLAIM, String.class));
        assertEquals(authUser.getEmail(), claims.get(TokenUtil.EXTERNAL_EMAIL_CLAIM, String.class));

        assertTrue(claims.getExpiration().after
                (GregorianCalendar.getInstance().getTime()));
    }


    @Test
    public void testGenerateValidate() {

        User user = new User();
        user.setId("123");
        user.setEmail("test@test.de");
        user.setSurName("lastname");
        user.setGivenName("firstname");

        AuthenticatedUser authUser = new AuthenticatedUser("456", "test@test2.de", LoginProviderType.EMAIL_PASSWORD);

        String token = TokenUtil.getInstance().genToken(user, authUser);
        assertTrue(TokenUtil.getInstance().verifyToken(token));
    }

    @Test
    public void testReadFromDatabase() throws IllegalBlockSizeException, InvalidKeyException, BadPaddingException, NoSuchAlgorithmException, NoSuchPaddingException {
        // setup db
        PersistenceManager mgr = PMF.get().getPersistenceManager();
        KeyPair keyPair = RsaProvider.generateKeyPair();

        final String PRIVATE_KEY_SECRET_IDENTIFIER = "JWT-private-key";
        final String PUBLIC_KEY_SECRET_IDENTIFIER = "JWT-public-key";

        try {
            StoredSecret privateSecret = new StoredSecret(PRIVATE_KEY_SECRET_IDENTIFIER, new com.google.appengine.api.datastore.Blob(keyPair.getPrivate().getEncoded()));
            StoredSecret publicKeySecret = new StoredSecret(PUBLIC_KEY_SECRET_IDENTIFIER, new com.google.appengine.api.datastore.Blob(keyPair.getPublic().getEncoded()));

            mgr.makePersistent(privateSecret);
            mgr.makePersistent(publicKeySecret);
        } finally {
            mgr.close();
        }

        validateKeyEqual(keyPair.getPublic(), TokenUtil.getInstance().getPublicKey());
    }

    @Test
    public void testReadFromCache() throws IllegalBlockSizeException, InvalidKeyException, BadPaddingException, NoSuchAlgorithmException, NoSuchPaddingException {
        KeyPair keyPair = RsaProvider.generateKeyPair();

        final String PRIVATE_KEY_SECRET_IDENTIFIER = "JWT-private-key";
        final String PUBLIC_KEY_SECRET_IDENTIFIER = "JWT-public-key";

        PKCS8EncodedKeySpec encodedPrivateKey = new PKCS8EncodedKeySpec(keyPair.getPrivate().getEncoded());
        StoredSecret privateSecret = new StoredSecret(PRIVATE_KEY_SECRET_IDENTIFIER, new com.google.appengine.api.datastore.Blob(encodedPrivateKey.getEncoded()));
        X509EncodedKeySpec encodedPublicKey = new X509EncodedKeySpec(keyPair.getPublic().getEncoded());
        StoredSecret publicKeySecret = new StoredSecret(PUBLIC_KEY_SECRET_IDENTIFIER, new com.google.appengine.api.datastore.Blob(encodedPublicKey.getEncoded()));

        Cache.cache(PRIVATE_KEY_SECRET_IDENTIFIER, StoredSecret.class, privateSecret);
        Cache.cache(PUBLIC_KEY_SECRET_IDENTIFIER, StoredSecret.class, publicKeySecret);

        validateKeyEqual(keyPair.getPublic(), TokenUtil.getInstance().getPublicKey());
    }

    private void validateKeyEqual(PublicKey originalKey, PublicKey restoredKey) throws NoSuchAlgorithmException, NoSuchPaddingException, InvalidKeyException, IllegalBlockSizeException, BadPaddingException {
        byte[] originalKeyBytes =originalKey.getEncoded();
        byte[] restoredKeyBytes = restoredKey.getEncoded();

        assertEquals(originalKeyBytes.length, restoredKeyBytes.length);
        for(int i = 0; i < originalKeyBytes.length; ++i) {
            assertEquals(originalKeyBytes[i], restoredKeyBytes[i]);
        }
    }
}