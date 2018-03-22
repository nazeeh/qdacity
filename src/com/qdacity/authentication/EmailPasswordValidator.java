package com.qdacity.authentication;

import com.qdacity.authentication.util.TokenUtil;
import com.qdacity.user.LoginProviderType;
import io.jsonwebtoken.Claims;

public class EmailPasswordValidator implements TokenValidator {

    @Override
    public AuthenticatedUser validate(String token) {
        TokenUtil tokenUtil = TokenUtil.getInstance();

        Claims claims = tokenUtil.readClaims(token);
        if(!tokenUtil.verifyClaims(claims)) {
            return null;
        }

        return new AuthenticatedUser(claims.get("email", String.class), // convention: email is id
                claims.get("email", String.class), LoginProviderType.EMAIL_PASSWORD);
    }
}
