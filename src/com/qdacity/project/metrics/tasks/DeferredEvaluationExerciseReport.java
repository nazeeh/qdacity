package com.qdacity.project.metrics.tasks;

import com.google.api.server.spi.auth.common.User;
import com.qdacity.exercise.ExerciseProject;
import com.qdacity.project.ProjectType;
import com.qdacity.project.metrics.ExerciseReport;
import com.qdacity.project.metrics.Report;


import javax.jdo.Query;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class DeferredEvaluationExerciseReport extends DeferredEvaluation {

    public DeferredEvaluationExerciseReport(Long revisionID, String name, String docIDsString, String evaluationMethod, String unitOfCoding, String raterIds, User user) {
        super(revisionID, name, docIDsString, evaluationMethod, unitOfCoding, raterIds, user);
    }

    @Override
    public void initProjects() {
        Query q;
        q = getPersistenceManager().newQuery(ExerciseProject.class, "revisionID  == :revisionID");

        Map<String, Long> params = new HashMap<>();
        params.put("revisionID", revisionID);
        //Hint: Only gets the exerciseProjects from Users, but not the project itself. This behaviour is wanted.
        super.setProjectsFromUsers((List<ExerciseProject>) q.executeWithMap(params));
        super.setExerciseProjectsFromUsers((List<ExerciseProject>) q.executeWithMap(params));
    }

    @Override
    public Report initReport() {
        ExerciseReport exerciseReport = new ExerciseReport();
        getPersistenceManager().makePersistent(exerciseReport); // Generate ID right away so we have an ID to pass to ExerciseResults
        exerciseReport.setRevisionID(revisionID);
        exerciseReport.setName(name);
        exerciseReport.setDatetime(new Date());
        exerciseReport.setEvaluationUnit(super.getEvalUnit());
        exerciseReport.setProjectID(super.getExerciseProjectsFromUsers().get(0).getProjectID());
        exerciseReport.setEvaluationType(super.getEvaluationMethod());
        super.setProjectType(ProjectType.EXERCISE);
        return exerciseReport;    }
}
