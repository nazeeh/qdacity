package com.qdacity.logs;

public enum ChangeType {
	
	CREATED(1), MODIFIED(2), DELETED(3);

	private final int value;
    private ChangeType(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }
}
