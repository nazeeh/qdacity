package com.qdacity.authentication.util;

import org.mindrot.jbcrypt.BCrypt;

public class HashUtil {

    public String hash(String unhashed) {
        return BCrypt.hashpw(unhashed, BCrypt.gensalt());
    }

    public boolean verify(String unhashed, String hashed) {
        return BCrypt.checkpw(unhashed, hashed);
    }
}
