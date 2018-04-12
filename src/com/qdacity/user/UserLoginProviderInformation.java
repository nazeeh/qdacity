package com.qdacity.user;

import java.io.Serializable;

import javax.jdo.annotations.*;
import javax.persistence.DiscriminatorColumn;
import javax.persistence.DiscriminatorType;
import javax.persistence.DiscriminatorValue;

import com.google.appengine.api.datastore.Key;

@PersistenceCapable(identityType = IdentityType.APPLICATION)
@Unique(members = {"provider", "externalUserId"})
public class UserLoginProviderInformation implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = 4914400462723750975L;

	@PrimaryKey
	@Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
	private Key key;
	
	@Persistent
	LoginProviderType provider;

	@Persistent
	String externalUserId;

	@Persistent
	String externalEmail;

	public UserLoginProviderInformation() {	}
	
	public UserLoginProviderInformation(LoginProviderType provider, String externalUserId, String externalEmail) {
		this.provider = provider;
		this.externalUserId = externalUserId;
		this.externalEmail = externalEmail;
	}

	public Key getKey() {
		return key;
	}

	public void setKey(Key key) {
		this.key = key;
	}

	public LoginProviderType getProvider() {
		return provider;
	}

	public void setProvider(LoginProviderType provider) {
		this.provider = provider;
	}

	public String getExternalUserId() {
		return externalUserId;
	}

	public void setExternalUserId(String userId) {
		this.externalUserId = userId;
	}

    public String getExternalEmail() {
        return externalEmail;
    }

    public void setExternalEmail(String externalEmail) {
        this.externalEmail = externalEmail;
    }
}