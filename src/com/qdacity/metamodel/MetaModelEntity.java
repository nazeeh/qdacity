package com.qdacity.metamodel;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

@PersistenceCapable(identityType = IdentityType.APPLICATION)
public class MetaModelEntity {
	@PrimaryKey
	@Persistent(
			valueStrategy = IdGeneratorStrategy.IDENTITY)
		Long id;
	
	@Persistent
	String name;
	
	@Persistent
	Long metaModelId;
	
	@Persistent
	String attributes;
	
	@Persistent
	Boolean isAbstract;

	@Persistent
	MetaModelEntityType type;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Long getMetaModelId() {
		return metaModelId;
	}

	public void setMetaModelId(Long metaModelId) {
		this.metaModelId = metaModelId;
	}

	public String getAttributes() {
		return attributes;
	}

	public void setAttributes(String attributes) {
		this.attributes = attributes;
	}

	public Boolean getIsAbstract() {
		return isAbstract;
	}

	public void setIsAbstract(Boolean isAbstract) {
		this.isAbstract = isAbstract;
	}

	public MetaModelEntityType getType() {
		return type;
	}

	public void setType(MetaModelEntityType type) {
		this.type = type;
	}
	
	
}
