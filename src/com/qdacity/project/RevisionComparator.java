package com.qdacity.project;

import java.util.Comparator;

public class RevisionComparator implements Comparator<ProjectRevision> {
	@Override
	public int compare(ProjectRevision p1, ProjectRevision p2) {
		return p2.getRevision().compareTo(p1.getRevision());
	}
}