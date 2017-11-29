package com.qdacity.authentication;

import com.qdacity.user.LoginProviderType;

public class AuthenticatedUser extends com.google.api.server.spi.auth.common.User {

	/**
	 * 
	 */
	private static final long serialVersionUID = -4266632009599927755L;
	
	private LoginProviderType provider;
	
	public AuthenticatedUser(String id, String email, LoginProviderType provider) {
		super(id, email);
		this.provider = provider;
	}

	public LoginProviderType getProvider() {
		return provider;
	}

	public void setProvider(LoginProviderType provider) {
		this.provider = provider;
	}
}
