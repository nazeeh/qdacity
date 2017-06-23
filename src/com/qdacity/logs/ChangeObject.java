package com.qdacity.logs;

public enum ChangeObject {

	CODE(1),
	CODEBOOK_ENTRY(2),
	DOCUMENT(3);

	private final int value;

	private ChangeObject(int value) {
		this.value = value;
	}

	public int getValue() {
		return value;
	}
}
