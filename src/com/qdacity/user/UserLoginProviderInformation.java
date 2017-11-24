package com.qdacity.user;

import java.io.Serializable;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;
import javax.jdo.annotations.Unique;

import com.google.api.client.util.Key;

@PersistenceCapable(identityType = IdentityType.APPLICATION)
@Unique(members = {"provider", "userId"})
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
	
	public UserLoginProviderInformation() {	}
	
	public UserLoginProviderInformation(LoginProviderType provider, String externalUserId) {
		this.provider = provider;
		this.externalUserId = externalUserId;
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
}