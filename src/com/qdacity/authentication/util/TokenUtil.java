package com.qdacity.authentication.util;


import com.qdacity.Cache;
import com.qdacity.PMF;
import com.qdacity.authentication.AuthenticatedUser;
import com.qdacity.authentication.StoredSecret;
import com.qdacity.user.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.impl.crypto.RsaProvider;

import javax.jdo.JDOObjectNotFoundException;
import javax.jdo.PersistenceManager;
import java.security.*;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Util class that deals with JWT tokens.
 * Makes use of RSA.
 */
public class TokenUtil {

    /**
     * Time in minutes until tokens expire.
     */
    private static final int TOKEN_VALIDITY_TIME = 40;
    public static final String JWT_ISSUER = "QDACity";
    public static final String NAME_CLAIM = "name";
    public static final String FIRSTNAME_CLAIM = "firstname";
    public static final String LASTNAME_CLAIM = "lastname";
    public static final String EMAIL_CLAIM = "email";
    public static final String AUTH_NETWORK_CLAIM = "auth_network";
    public static final String EXTERNAL_USER_ID_CLAIM = "external_user_id";
    public static final String EXTERNAL_EMAIL_CLAIM = "external_email";

    private static TokenUtil instance = null;

    private final KeyPair keyPair;

    /**
     * These contants are used as keys for the StoredSecret.
     */
    private static final String PRIVATE_KEY_SECRET_IDENTIFIER = "JWT-private-key";
    private static final String PUBLIC_KEY_SECRET_IDENTIFIER = "JWT-public-key";

    private TokenUtil() {
        byte[] privateKeySerialized = null;
        byte[] publicKeySerialized = null;
        try {
            privateKeySerialized = ((StoredSecret) Cache.getOrLoad(PRIVATE_KEY_SECRET_IDENTIFIER, StoredSecret.class)).getValue().getBytes();
            publicKeySerialized = ((StoredSecret) Cache.getOrLoad(PUBLIC_KEY_SECRET_IDENTIFIER, StoredSecret.class)).getValue().getBytes();
        } catch (JDOObjectNotFoundException e) {
            // privateKeySerialized or publicKeySerialized is null
            Logger.getLogger("logger").log(Level.INFO, "Didn't find RSA keys in the database. Going to create some new and store it.");
        }

        if(privateKeySerialized == null || publicKeySerialized == null) {
            // generate new pair
            keyPair = genAndStoreKeyPair();
        } else {

            PublicKey publicKey = null;
            PrivateKey privateKey = null;
            try {
                publicKey = KeyFactory.getInstance("RSA").generatePublic(new X509EncodedKeySpec(publicKeySerialized));
                privateKey = KeyFactory.getInstance("RSA").generatePrivate(new PKCS8EncodedKeySpec(privateKeySerialized));
            } catch (InvalidKeySpecException | NoSuchAlgorithmException e) {
                // publicKey or privateKey is null
                Logger.getLogger("logger").log(Level.SEVERE, "Couldn't decrypt loaded RSA keys.", e);
            }

            if(privateKey == null || publicKey == null) {
                // generate new pair
                keyPair = genAndStoreKeyPair();
            } else {
                keyPair = new KeyPair(publicKey, privateKey);
            }

        }
    }

    /**
     * generates new keyPair, stores into StoredSecret and caches both StoredSecrets.
     * @return
     */
    private KeyPair genAndStoreKeyPair() {
        KeyPair keyPair = RsaProvider.generateKeyPair();

        PersistenceManager mgr = getPersistenceManager();
        try {
            StoredSecret privateKeySecret = new StoredSecret(PRIVATE_KEY_SECRET_IDENTIFIER, new com.google.appengine.api.datastore.Blob(keyPair.getPrivate().getEncoded()));
            StoredSecret publicKeySecret = new StoredSecret(PUBLIC_KEY_SECRET_IDENTIFIER, new com.google.appengine.api.datastore.Blob(keyPair.getPublic().getEncoded()));

            mgr.makePersistent(privateKeySecret);
            mgr.makePersistent(publicKeySecret);

            Cache.cache(PRIVATE_KEY_SECRET_IDENTIFIER, StoredSecret.class, privateKeySecret);
            Cache.cache(PUBLIC_KEY_SECRET_IDENTIFIER, StoredSecret.class, publicKeySecret);
        } finally {
            mgr.close();
        }

        return keyPair;
    }

    /**
     * Singleton instance method
     * @return
     */
    public static synchronized TokenUtil getInstance() {
        if(instance == null) instance = new TokenUtil();
        return instance;
    }

    /**
     * generates a JWT token.
     * @param user
     * @return
     */
    public String genToken(User user, AuthenticatedUser authUser) {

        Calendar cal = GregorianCalendar.getInstance();
        cal.add(Calendar.MINUTE, TOKEN_VALIDITY_TIME);

        Map<String, Object> customClaimsMap = new HashMap<String, Object>();
        customClaimsMap.put(NAME_CLAIM, user.getGivenName() + " " + user.getSurName());
        customClaimsMap.put(FIRSTNAME_CLAIM, user.getGivenName());
        customClaimsMap.put(LASTNAME_CLAIM, user.getSurName());
        customClaimsMap.put(EMAIL_CLAIM, user.getEmail());
        customClaimsMap.put(AUTH_NETWORK_CLAIM, authUser.getProvider());
        customClaimsMap.put(EXTERNAL_USER_ID_CLAIM, authUser.getId());
        customClaimsMap.put(EXTERNAL_EMAIL_CLAIM, authUser.getEmail());

        String compactJws =  Jwts.builder()
                .setHeaderParam("typ", "JWT")
                .setClaims(customClaimsMap)
                .setSubject(user.getId())
                .setIssuer(JWT_ISSUER)
                .setExpiration(cal.getTime())
                .setIssuedAt(GregorianCalendar.getInstance().getTime())
                .signWith(SignatureAlgorithm.RS512, keyPair.getPrivate())
                .compact();

        return compactJws;
    }

    /**
     * checks if the given token is valid
     * @param token
     * @return
     */
    public boolean verifyToken(String token) {
        try {
            Claims claims = readClaims(token);
            return verifyClaims(claims);
        } catch (io.jsonwebtoken.MalformedJwtException ex) {
            return false;
        }
    }

    /**
     * checks if the given claims are valid
     * @param claims
     * @return
     */
    public boolean verifyClaims(Claims claims) {
        if(!claims.getIssuer().equals(JWT_ISSUER)) {
            return false;
        }

        if(claims.getExpiration().before
                (GregorianCalendar.getInstance().getTime())) {
            return false;
        }

        return true;
    }

    /**
     * read the claims from token
     * @param token
     * @return
     */
    public Claims readClaims(String token) {
        return Jwts.parser().setSigningKey(keyPair.getPublic()).parseClaimsJws(token).getBody();
    }

    /**
     * Returns the RSA public key
     * @return
     */
    public PublicKey getPublicKey() {
        return keyPair.getPublic();
    }


    private static PersistenceManager getPersistenceManager() {
        return PMF.get().getPersistenceManager();
    }
}
