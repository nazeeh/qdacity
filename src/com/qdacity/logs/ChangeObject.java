package com.qdacity.logs;

public enum ChangeObject {

	CODE(1),
	DOCUMENT(2);

	private final int value;

	private ChangeObject(int value) {
		this.value = value;
	}

	public int getValue() {
		return value;
	}
}
