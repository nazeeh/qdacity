package com.qdacity.project.metrics.tasks;

import com.google.api.server.spi.auth.common.User;
import com.qdacity.project.ProjectType;
import com.qdacity.project.ValidationProject;
import com.qdacity.project.metrics.Report;
import com.qdacity.project.metrics.ValidationReport;

import javax.jdo.Query;
import java.util.Date;
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
        super.setProjectsFromUsers((List<ValidationProject>) q.executeWithMap(params));
        super.setValidationProjectsFromUsers((List<ValidationProject>) q.executeWithMap(params));
    }

    @Override
    public Report initReport() {
        ValidationReport validationReport = new ValidationReport();
        getPersistenceManager().makePersistent(validationReport); // Generate ID right away so we have an ID to pass to ValidationResults
        validationReport.setRevisionID(revisionID);
        validationReport.setName(name);
        validationReport.setDatetime(new Date());
        validationReport.setEvaluationUnit(super.getEvalUnit());
        validationReport.setProjectID(super.getValidationProjectsFromUsers().get(0).getProjectID());
        validationReport.setEvaluationType(super.getEvaluationMethod());
        super.setProjectType(ProjectType.VALIDATION);
        return validationReport;    }
}
