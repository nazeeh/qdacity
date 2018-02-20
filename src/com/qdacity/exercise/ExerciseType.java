package com.qdacity.exercise;

public enum ExerciseType {
	Codebook(1);
	private final int value;

	private ExerciseType(int value) {
		this.value = value;
	}

	public int getValue() {
		return value;
	}
}
