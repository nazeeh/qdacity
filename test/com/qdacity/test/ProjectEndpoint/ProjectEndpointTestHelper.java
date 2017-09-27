package com.qdacity.test.ProjectEndpoint;

import com.google.api.server.spi.response.UnauthorizedException;
import com.qdacity.endpoint.ProjectEndpoint;
import com.qdacity.project.Project;

public class ProjectEndpointTestHelper {
	static public void addProject(Long id, String name, String description, Long codesystemID, com.google.appengine.api.users.User loggedInUser) throws UnauthorizedException {
		Project project = new Project();
		project.setId(id);
		project.setName(name);
		project.setDescription(description);
		project.setCodesystemID(codesystemID);

		ProjectEndpoint ue = new ProjectEndpoint();
		ue.insertProject(project, loggedInUser);
	}

	static public void removeProject(Long id, com.google.appengine.api.users.User loggedInUser) throws UnauthorizedException {
		ProjectEndpoint ue = new ProjectEndpoint();
		ue.removeProject(id, loggedInUser);
	}
}
