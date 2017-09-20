package com.qdacity.test.ProjectEndpoint;

import com.google.api.server.spi.response.UnauthorizedException;
import com.qdacity.endpoint.ProjectEndpoint;
import com.qdacity.project.Project;

public class ProjectEndpointTestHelper {
	static public void addProject(Long id, String name, String description, com.google.appengine.api.users.User loggedInUser) throws UnauthorizedException {
		Project project = new Project();
		project.setId(id);
		project.setName(name);
		project.setDescription(description);


		ProjectEndpoint ue = new ProjectEndpoint();
		ue.insertProject(project, loggedInUser);
	}
}
