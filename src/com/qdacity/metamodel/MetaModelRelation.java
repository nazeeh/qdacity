package com.qdacity.metamodel;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

@PersistenceCapable(identityType = IdentityType.APPLICATION)
public class MetaModelRelation {
	
	@PrimaryKey
	@Persistent(
			valueStrategy = IdGeneratorStrategy.IDENTITY)
		Long id;
	
	@Persistent
	Long metaModelId;

	@Persistent
	Long src;
	
	@Persistent
	Long dst;
	
	@Persistent
	String label;
	
	@Persistent
	String type;
	
	@Persistent
	String cardinality;

	public Long getMetaModelId() {
		return metaModelId;
	}

	public void setMetaModelId(Long metaModelId) {
		this.metaModelId = metaModelId;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getSrc() {
		return src;
	}

	public void setSrc(Long src) {
		this.src = src;
	}

	public Long getDst() {
		return dst;
	}

	public void setDst(Long dst) {
		this.dst = dst;
	}

	public String getLabel() {
		return label;
	}

	public void setLabel(String label) {
		this.label = label;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getCardinality() {
		return cardinality;
	}

	public void setCardinality(String cardinality) {
		this.cardinality = cardinality;
	}

}
