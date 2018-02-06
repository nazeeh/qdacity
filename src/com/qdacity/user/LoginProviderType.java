package com.qdacity.user;

public enum LoginProviderType {
	GOOGLE(1);

	private final int value;

	private LoginProviderType(int value) {
		this.value = value;
	}

	public int getValue() {
		return value;
	}
}
