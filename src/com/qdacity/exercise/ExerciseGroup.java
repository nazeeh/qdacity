package com.qdacity.exercise;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

@PersistenceCapable(
	identityType = IdentityType.APPLICATION)


public class ExerciseGroup implements Serializable {

    private static final long serialVersionUID = 683481646663394456L;

    @PrimaryKey
	@Persistent(
		valueStrategy = IdGeneratorStrategy.IDENTITY)
	Long id;

    @Persistent
    Long projectRevisionID;

	@Persistent
	Long termCourseID;

	@Persistent
	String name;

	@Persistent
	List<String> exercises;

	@Persistent
	Long exerciseProjectID;

	public ExerciseGroup() {
		super();
		// TODO Auto-generated constructor stub
	}
	
	public Long getId() {
		return id;
	}
	
	public void setId(Long id) {
		this.id = id;
	}


	public void setName(String name) {
		this.name = name;
	}
	
	public String getName() {
		return name;
	}


	public Long getTermCourseID() {
		return termCourseID;
	}
	
	public void setTermCourseID(Long termCourseID) {
		this.termCourseID = termCourseID;
	}

    public Long getExerciseProjectID() {
        return exerciseProjectID;
    }

    public void setExerciseProjectID(Long exerciseProjectID) {
	    this.exerciseProjectID = exerciseProjectID;
    }

    public Long getProjectRevisionID() {
        return projectRevisionID;
    }

    public void setProjectRevisionID(Long projectRevisionID) {
        this.projectRevisionID = projectRevisionID;
    }

    public List<String> getExercises() {
        return exercises;
    }

    public void setExercises(List<String> exercises) {
        this.exercises = exercises;
    }

    public void addExercise(String exerciseID) {
        if (exercises == null) exercises = new ArrayList<String>();
        if (!exercises.contains(exerciseID)) exercises.add(exerciseID);
    }

    public void removeExercise(String exerciseID) {
        if (exercises == null) exercises = new ArrayList<String>();
        if (exercises.contains(exerciseID)) exercises.remove(exerciseID);
    }
}
