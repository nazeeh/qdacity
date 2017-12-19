package com.qdacity.tutorial;

public enum TutorialGroup {
	
	DEFAULT(1), BASIC(2), ADVANCED(3), USER_DEFINED(4);
	
	private final int value;

	private TutorialGroup(int value) {
		this.value = value;
	}

	public int getValue() {
		return value;
	}
	
}
