package com.qdacity.authentication;

import com.qdacity.user.EmailPasswordLogin;

import javax.jdo.annotations.*;

/**
 * Represents an unconfirmed email password registration / association.
 */
@PersistenceCapable(identityType = IdentityType.APPLICATION)
@Inheritance(strategy=InheritanceStrategy.SUPERCLASS_TABLE)
@Discriminator(strategy = DiscriminatorStrategy.CLASS_NAME)
public class UnconfirmedEmailPasswordLogin extends EmailPasswordLogin {

	@Persistent
	private String secret;

	@Persistent
	private String givenName;

	@Persistent
	private String surName;

	@Persistent
	private boolean confirmed;

	/**
	 * The email is also the externalUserId!
	 *
	 * @param email
	 * @param hashedPwd
	 */
	public UnconfirmedEmailPasswordLogin(String email, String hashedPwd, String givenName, String surName, String secret) {
		super(email, hashedPwd);
		this.givenName = givenName;
		this.surName = surName;
		this.secret = secret;
		this.confirmed = false;
	}

	public String getSecret() {
		return secret;
	}

	public void setSecret(String secret) {
		this.secret = secret;
	}

	public boolean isConfirmed() {
		return confirmed;
	}

	public void setConfirmed(boolean confirmed) {
		this.confirmed = confirmed;
	}

	public String getGivenName() {
		return givenName;
	}

	public void setGivenName(String givenName) {
		this.givenName = givenName;
	}

	public String getSurName() {
		return surName;
	}

	public void setSurName(String surName) {
		this.surName = surName;
	}
}
