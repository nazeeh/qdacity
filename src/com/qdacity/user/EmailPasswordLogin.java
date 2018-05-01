package com.qdacity.user;

import javax.jdo.annotations.*;

@PersistenceCapable(identityType = IdentityType.APPLICATION)
public class EmailPasswordLogin {

    @PrimaryKey
    @Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
    String email;

    /**
     * Hashed and salted!
     */
    @Persistent
    String hashedPwd;

    /**
     * The email is also the externalUserId!
     * @param email
     * @param hashedPwd
     */
    public EmailPasswordLogin(String email, String hashedPwd) {
        this.email = email;
        this.hashedPwd = hashedPwd;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getHashedPwd() {
        return hashedPwd;
    }

    public void setHashedPwd(String hashedPwd) {
        this.hashedPwd = hashedPwd;
    }
}
