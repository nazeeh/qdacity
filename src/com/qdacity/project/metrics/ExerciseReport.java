package com.qdacity.project.metrics;

import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;

@PersistenceCapable(
        identityType = IdentityType.APPLICATION)

public class ExerciseReport extends Report {

    @Persistent
    Long exerciseID;

    public Long getExerciseID() {
        return exerciseID;
    }

    public void setExerciseID(Long exerciseID) {
        this.exerciseID = exerciseID;
    }
}
