package com.qdacity.project.metrics;

import java.io.Serializable;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import com.google.appengine.api.datastore.Key;

//TODO needs to stay persistence cabable until datamigration is completed.
@PersistenceCapable(
	identityType = IdentityType.APPLICATION)
public class FMeasureResult implements Serializable {
	/**
	 * 
	 */
	private static final long serialVersionUID = 6863389957461687553L;

	@PrimaryKey
	@Persistent(
		valueStrategy = IdGeneratorStrategy.IDENTITY)
	private Key key;

	@Persistent(
		defaultFetchGroup = "true",
		dependent = "true")
	double fMeasure;

	@Persistent(
		defaultFetchGroup = "true",
		dependent = "true")
	double recall;

	@Persistent(
		defaultFetchGroup = "true",
		dependent = "true")
	double precision;

	public FMeasureResult() {
		// TODO Auto-generated constructor stub
	}

	public FMeasureResult(FMeasureResult copy) {
		super();
		this.fMeasure = copy.fMeasure;
		this.recall = copy.recall;
		this.precision = copy.precision;
	}

	public double getFMeasure() {
		return fMeasure;
	}

	public void setFMeasure(double paragraphFMeasure) {
		this.fMeasure = paragraphFMeasure;
	}

	public double getRecall() {
		return recall;
	}

	public void setRecall(double paragraphRecall) {
		this.recall = paragraphRecall;
	}

	public double getPrecision() {
		return precision;
	}

	public void setPrecision(double paragraphPrecision) {
		this.precision = paragraphPrecision;
	}

}
