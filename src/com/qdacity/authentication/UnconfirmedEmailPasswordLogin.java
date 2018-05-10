package com.qdacity.authentication;

import javax.jdo.annotations.*;
import java.io.Serializable;

/**
 * Represents an unconfirmed email password registration / association.
 */
@PersistenceCapable(identityType = IdentityType.APPLICATION)
public class UnconfirmedEmailPasswordLogin implements Serializable {

	@PrimaryKey
	@Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
	String email;

	/**
	 * Hashed and salted!
	 */
	@Persistent
	String hashedPwd;

	@Persistent
	private String confirmationCode;

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
	public UnconfirmedEmailPasswordLogin(String email, String hashedPwd, String givenName, String surName, String confirmationCode) {
		this.email = email;
		this.hashedPwd = hashedPwd;
		this.givenName = givenName;
		this.surName = surName;
		this.confirmationCode = confirmationCode;
		this.confirmed = false;
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

	public String getConfirmationCode() {
		return confirmationCode;
	}

	public void setConfirmationCode(String confirmationCode) {
		this.confirmationCode = confirmationCode;
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
