package com.qdacity.tutorial;

import java.io.Serializable;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;
import javax.jdo.annotations.Unique;

/**
 * 
 * A POJO, which save for each user his current Tutoral-Step position and a few more data for a specific Tutorial WHICH
 * TODO rename WHICH into a specific name
 *
 */


@Unique(name="xxx", members={"relatedUserId", "which"})
@PersistenceCapable(
	identityType = IdentityType.APPLICATION)
public class TutorialLog implements Serializable {


	@PrimaryKey
	@Persistent(
		valueStrategy = IdGeneratorStrategy.IDENTITY)
	private Long id;

	@Persistent
	private String relatedUserId="";
	
	@Persistent
	private long which=0;	
	
	@Persistent
	private long finishTime=0;
	
	@Persistent
	private long step=0;

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public String getRelatedUserId() {
		return relatedUserId;
	}

	public void setRelatedUserId(String relatedUserId) {
		this.relatedUserId = relatedUserId;
	}

	public long getWhich() {
		return which;
	}

	public void setWhich(long which) {
		this.which = which;
	}

	public long getFinishTime() {
		return finishTime;
	}

	public void setFinishTime(long finishTime) {
		this.finishTime = finishTime;
	}

	public long getStep() {
		return step;
	}

	public void setStep(long step) {
		this.step = step;
	}
	
	
	
	
}
