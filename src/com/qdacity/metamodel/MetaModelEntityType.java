package com.qdacity.metamodel;

public enum MetaModelEntityType {
	PROPERTY(1), RELATIONSHIP(2), OTHER(3);
	private final int value;

	private MetaModelEntityType(int value) {
		this.value = value;
	}

	public int getValue() {
		return value;
	}
}
