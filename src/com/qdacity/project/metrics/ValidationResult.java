package com.qdacity.project.metrics;

import com.qdacity.project.metrics.Report;
import com.qdacity.project.metrics.Result;

import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;

@PersistenceCapable(
        identityType = IdentityType.APPLICATION)

public class ValidationResult extends Result {
}
