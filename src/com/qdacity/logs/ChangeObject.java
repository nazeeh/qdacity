package com.qdacity.logs;

public enum ChangeObject {

	CODE(1);

	private final int value;

	private ChangeObject(int value) {
		this.value = value;
	}

	public int getValue() {
		return value;
	}
}
