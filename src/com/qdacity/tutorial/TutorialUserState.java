package com.qdacity.tutorial;

import java.io.Serializable;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;
import javax.jdo.annotations.Unique;

/**
 * A POJO, which logs the user interaction with the tutorial modul
 * For administrative data-analysis * 
 *
 */

@Unique(name="xxx", members={"relatedUserId", "which"})
@PersistenceCapable(
	identityType = IdentityType.APPLICATION)
public class TutorialUserState implements Serializable {

	@PrimaryKey
	@Persistent(
		valueStrategy = IdGeneratorStrategy.IDENTITY)
	private Long id;

	@Persistent
	private String relatedUserId="";
	
	@Persistent
	private long which=0;	
	
	@Persistent
	private long createTime=0;
	
	@Persistent
	private long lastStep=0;
	
	@Persistent
	private long whenLastStepFinish=0;
	
	@Persistent
	private boolean complete=false;

	
	
	
	public TutorialUserState()
	{
		
	}
	
	
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

	public long getCreateTime() {
		return createTime;
	}

	public void setCreateTime(long createTime) {
		this.createTime = createTime;
	}

	public long getLastStep() {
		return lastStep;
	}

	public void setLastStep(long lastStep) {
		this.lastStep = lastStep;
	}

	public long getWhenLastStepFinish() {
		return whenLastStepFinish;
	}

	public void setWhenLastStepFinish(long whenLastStepFinish) {
		this.whenLastStepFinish = whenLastStepFinish;
	}

	public boolean isComplete() {
		return complete;
	}

	public void setComplete(boolean complete) {
		this.complete = complete;
	}


}
