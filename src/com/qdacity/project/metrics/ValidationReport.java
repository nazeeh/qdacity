package com.qdacity.project.metrics;

import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;

@PersistenceCapable(
        identityType = IdentityType.APPLICATION)

public class ValidationReport extends Report {
}
