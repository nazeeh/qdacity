package com.qdacity.authentication;

/**
 * FacebookTokenValidationResponse is required to parse the result of an
 * access token validation by facebook from JSON.
 */
public class FacebookTokenValidationResponse {

    private String email;
    private String name;
    private String id;

    public FacebookTokenValidationResponse() {}

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }
}
