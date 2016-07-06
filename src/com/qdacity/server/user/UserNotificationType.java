package com.qdacity.server.user;

public enum UserNotificationType {
	INVITATION(1), VALIDATION_REQUEST(2);

	private final int value;
    private UserNotificationType(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }
}
