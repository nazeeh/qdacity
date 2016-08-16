package com.qdacity.taskboard;

public enum TaskPriority {
	HIGH(1), MEDIUM(2), LOW(3);

	private final int value;
    private TaskPriority(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }
}
