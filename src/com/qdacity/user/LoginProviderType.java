package com.qdacity.user;

public enum LoginProviderType {
	GOOGLE(1),
	EMAIL_PASSWORD(2);

	private final int value;

	LoginProviderType(int value) {
		this.value = value;
	}

	public int getValue() {
		return value;
	}
}
