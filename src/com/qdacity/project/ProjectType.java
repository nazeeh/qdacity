package com.qdacity.project;

public enum ProjectType {
	PROJECT(1), REVISION(2), VALIDATION(3), EXERCISE(4);
	private final int value;

	private ProjectType(int value) {
		this.value = value;
	}

	public int getValue() {
		return value;
	}
}
