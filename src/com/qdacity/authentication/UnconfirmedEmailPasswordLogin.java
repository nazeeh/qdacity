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
	private boolean confirmed;

	/**
	 * The email is also the externalUserId!
	 *
	 * @param email
	 * @param hashedPwd
	 */
	public UnconfirmedEmailPasswordLogin(String email, String hashedPwd, String secret) {
		super(email, hashedPwd);
		this.confirmed = false;
		this.secret = secret;
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
}
