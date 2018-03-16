package com.qdacity.user;

import javax.jdo.annotations.Inheritance;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;

@PersistenceCapable
@Inheritance
public class EmailPasswordLoginProviderInformation extends UserLoginProviderInformation {

    @Persistent
    String email;

    /**
     * Hashed and salted!
     */
    @Persistent
    String hashedPwd;

    public EmailPasswordLoginProviderInformation(String internalUserId, String email, String hashedPwd) {
        super(LoginProviderType.EMAIL_PASSWORD, internalUserId);
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
