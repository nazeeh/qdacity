package com.qdacity.authentication;

import java.io.Serializable;

import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

/**
 * StoredSecret represents a simple key -> value entity for storing secret keys.
 */
@PersistenceCapable(
		identityType = IdentityType.APPLICATION)
public class StoredSecret  implements Serializable{

	/**
	 * 
	 */
	private static final long serialVersionUID = -1402167360679298245L;
	
	@PrimaryKey
	@Persistent
	private String identifier;
	
	@Persistent
	private com.google.appengine.api.datastore.Text value;
	
	/**
	 * The default constructor.
	 */
	public StoredSecret() { }
	
	/**
	 * 
	 * @param identifier
	 * @param value
	 */
	public StoredSecret(String identifier, com.google.appengine.api.datastore.Text value) {
		this.identifier = identifier;
		this.value = value;
	}

	/**
	 * 
	 * @return
	 */
	public String getIdentifier() {
		return identifier;
	}

	/**
	 * 
	 * @param key
	 */
	public void setIdentifier(String Identifier) {
		this.identifier = Identifier;
	}

	/**
	 * 
	 * @return
	 */
	public com.google.appengine.api.datastore.Text getValue() {
		return value;
	}

	/**
	 * 
	 * @param value
	 */
	public void setValue(com.google.appengine.api.datastore.Text value) {
		this.value = value;
	}

	
}
