package com.qdacity.authentication;

import com.qdacity.authentication.util.TokenUtil;
import com.qdacity.user.LoginProviderType;
import io.jsonwebtoken.Claims;

public class CustomJWTValidator implements TokenValidator {

    @Override
    public AuthenticatedUser validate(String token) {
        TokenUtil tokenUtil = TokenUtil.getInstance();

        Claims claims = tokenUtil.readClaims(token);
        if(!tokenUtil.verifyClaims(claims)) {
            return null;
        }

        return new AuthenticatedUser(
                claims.get(TokenUtil.EXTERNAL_USER_ID_CLAIM, String.class), // convention: email is id
                claims.get(TokenUtil.EXTERNAL_EMAIL_CLAIM, String.class),
                LoginProviderType.valueOf(claims.get(TokenUtil.AUTH_NETWORK_CLAIM, String.class)));
    }
}
