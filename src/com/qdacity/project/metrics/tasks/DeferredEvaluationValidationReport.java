package com.qdacity.project.metrics.tasks;

import com.google.api.server.spi.auth.common.User;
import com.qdacity.project.ValidationProject;

import javax.jdo.Query;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class DeferredEvaluationValidationReport extends DeferredEvaluation {

    public DeferredEvaluationValidationReport(Long revisionID, String name, String docIDsString, String evaluationMethod, String unitOfCoding, String raterIds, User user) {
        super(revisionID, name, docIDsString, evaluationMethod, unitOfCoding, raterIds, user);
    }

    @Override
    public void initProjects() {
        Query q;
        q = getPersistenceManager().newQuery(ValidationProject.class, "revisionID  == :revisionID");

        Map<String, Long> params = new HashMap<>();
        params.put("revisionID", revisionID);
        //Hint: Only gets the validationProjects from Users, but not the project itself. This behaviour is wanted.
        super.setValidationProjectsFromUsers((List<ValidationProject>) q.executeWithMap(params));
    }
}
