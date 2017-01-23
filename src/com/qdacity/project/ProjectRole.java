package com.qdacity.project;

public enum ProjectRole {
	OWNER(1), CODER(2), VALIDATIONCODER(3);

	private final int value;

	private ProjectRole(int value) {
		this.value = value;
	}

	public int getValue() {
		return value;
	}
}
