package com.qdacity.user;

public enum UserNotificationType {
	INVITATION(1), VALIDATION_REQUEST(2), POSTED_VALIDATION_REQUEST(3), VALIDATION_REQUEST_GRANTED(4);

	private final int value;
    private UserNotificationType(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }
}
