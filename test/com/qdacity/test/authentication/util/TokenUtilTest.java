package com.qdacity.test.authentication.util;

import com.qdacity.authentication.util.TokenUtil;
import com.qdacity.user.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.junit.Test;

import java.util.GregorianCalendar;

import static org.junit.Assert.*;

public class TokenUtilTest {

    @Test
    public void testGeneratedClaims() {
        User user = new User();
        user.setId("123");
        user.setEmail("test@test.de");
        user.setSurName("lastname");
        user.setGivenName("firstname");

        String token = TokenUtil.getInstance().genToken(user);

        Claims claims = Jwts.parser().setSigningKey(TokenUtil.getInstance().getPublicKey()).parseClaimsJws(token).getBody();

        assertEquals("QDACity", claims.getIssuer());
        assertEquals(user.getId(), claims.getSubject());
        assertEquals(user.getGivenName() + " " + user.getSurName(), claims.get("name", String.class));
        assertEquals(user.getEmail(), claims.get("email", String.class));
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

        String token = TokenUtil.getInstance().genToken(user);
        assertTrue(TokenUtil.getInstance().verifyToken(token));
    }

}