package com.qdacity;

public enum AuthorizationLevel {
	ADMIN(1), CODER(2), VALIDATIONCODER(3), NONE(403);

	private final int value;

	private AuthorizationLevel(
			int value) {
		this.value = value;
	}

	public int getValue() {
		return value;
	}
}
