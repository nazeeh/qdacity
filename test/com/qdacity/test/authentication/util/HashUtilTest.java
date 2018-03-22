package com.qdacity.test.authentication.util;

import com.qdacity.authentication.util.HashUtil;
import org.junit.Test;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotEquals;
import static org.junit.Assert.assertTrue;

public class HashUtilTest {

    @Test
    public void testHash() {
        HashUtil hashUtil = new HashUtil();
        String password = "superduperpassword";

        String hashed = hashUtil.hash(password);
        assertTrue(hashUtil.verify(password, hashed));
    }

    @Test
    public void testHashUnequal() {
        HashUtil hashUtil = new HashUtil();
        String password = "superduperpassword";
        String unequalPassword = "superduperpasswor1";

        String hashed = hashUtil.hash(password);
        assertFalse(hashUtil.verify(unequalPassword, hashed));
    }

    @Test
    public void testSalt() {
        HashUtil hashUtil = new HashUtil();
        String password = "superduperpassword";
        
        assertNotEquals(hashUtil.hash(password), hashUtil.hash(password));
    }
}
