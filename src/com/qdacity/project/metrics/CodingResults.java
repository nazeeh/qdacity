package com.qdacity.project.metrics;

import java.io.Serializable;
import java.util.List;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import com.google.appengine.api.datastore.Key;

@PersistenceCapable(
	identityType = IdentityType.APPLICATION)
public class CodingResults implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = -3775478734937452076L;

	@PrimaryKey
	@Persistent(
		valueStrategy = IdGeneratorStrategy.IDENTITY)
	private Key key;

	@Persistent(
		defaultFetchGroup = "true")
	List<String> falsePositives;

	@Persistent(
		defaultFetchGroup = "true")
	List<String> truePositives;

	@Persistent(
		defaultFetchGroup = "true")
	List<String> falseNegatives;

	public CodingResults(CodingResults copy) {
		this.falsePositives = copy.falsePositives;
		this.truePositives = copy.truePositives;
		this.falseNegatives = copy.falseNegatives;
	}

	public CodingResults(List<String> falsePositives, List<String> truePositives, List<String> falseNegatives) {
		super();
		this.falsePositives = falsePositives;
		this.truePositives = truePositives;
		this.falseNegatives = falseNegatives;
	}

	public List<String> getFalsePositives() {
		return falsePositives;
	}

	public void setFalsePositives(List<String> falsePositives) {
		this.falsePositives = falsePositives;
	}

	public List<String> getTruePositives() {
		return truePositives;
	}

	public void setTruePositives(List<String> truePositives) {
		this.truePositives = truePositives;
	}

	public List<String> getFalseNegatives() {
		return falseNegatives;
	}

	public void setFalseNegatives(List<String> falseNegatives) {
		this.falseNegatives = falseNegatives;
	}

}
