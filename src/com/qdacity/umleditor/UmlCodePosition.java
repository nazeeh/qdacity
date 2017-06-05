package com.qdacity.umleditor;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

/**
 * Represents the position of a code in the uml editor.
 *
 */
@PersistenceCapable(
	identityType = IdentityType.APPLICATION)
public class UmlCodePosition {

	@PrimaryKey
	@Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
	private Long id;

	@Persistent
	private Long codeId;

	@Persistent
	private Long codeSystemId;
	
	@Persistent
	private double x;

	@Persistent
	private double y;
	
	public UmlCodePosition() {
		
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getCodeId() {
		return codeId;
	}

	public void setCodeId(Long codeId) {
		this.codeId = codeId;
	}

	public Long getCodeSystemId() {
		return codeSystemId;
	}

	public void setCodeSystemId(Long codeSystemId) {
		this.codeSystemId = codeSystemId;
	}

	public double getX() {
		return x;
	}

	public void setX(double x) {
		this.x = x;
	}

	public double getY() {
		return y;
	}

	public void setY(double y) {
		this.y = y;
	}
}
