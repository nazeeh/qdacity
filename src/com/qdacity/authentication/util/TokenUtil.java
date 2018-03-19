package com.qdacity.authentication.util;


import com.qdacity.user.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.impl.crypto.RsaProvider;

import java.security.Key;
import java.security.KeyPair;
import java.util.*;

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
    private static TokenUtil instance = null;

    private final KeyPair keyPair;

    private TokenUtil() {
        keyPair = RsaProvider.generateKeyPair();

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
    public String genToken(User user) {

        Calendar cal = GregorianCalendar.getInstance();
        cal.add(Calendar.MINUTE, TOKEN_VALIDITY_TIME);

        Map<String, Object> customClaimsMap = new HashMap<String, Object>();
        customClaimsMap.put("name", user.getGivenName() + " " + user.getSurName());
        customClaimsMap.put("email", user.getEmail());

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
        Claims claims = readClaims(token);

       return verifyClaims(claims);
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
    public Key getPublicKey() {
        return keyPair.getPrivate();
    }
}
