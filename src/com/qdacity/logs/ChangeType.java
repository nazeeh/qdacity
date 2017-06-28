package com.qdacity.logs;

public enum ChangeType {

	CREATED(1), MODIFIED(2), RELOCATE(3), DELETED(4);

	private final int value;

	private ChangeType(int value) {
		this.value = value;
	}

	public int getValue() {
		return value;
	}
}
