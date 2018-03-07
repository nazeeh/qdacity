package com.qdacity.test.ProjectEndpoint;

import static org.junit.Assert.fail;

import com.google.api.server.spi.auth.common.User;
import com.google.api.server.spi.response.UnauthorizedException;
import com.qdacity.endpoint.ProjectEndpoint;
import com.qdacity.project.Project;
import com.qdacity.test.CodeSystemEndpoint.CodeSystemTestHelper;

public class ProjectEndpointTestHelper {
	static public void addProject(Long id, String name, String description, Long codesystemID, User loggedInUser) throws UnauthorizedException {
		Project project = new Project();
		project.setId(id);
		project.setName(name);
		project.setDescription(description);
		project.setCodesystemID(codesystemID);

		ProjectEndpoint ue = new ProjectEndpoint();
		ue.insertProject(project, loggedInUser);
	}

	static public void removeProject(Long id, User loggedInUser) throws UnauthorizedException {
		ProjectEndpoint ue = new ProjectEndpoint();
		ue.removeProject(id, loggedInUser);
	}

	static public Project getProject(Long id, User loggedInUser) {

		try {
			ProjectEndpoint pe = new ProjectEndpoint();
			Project prj = (Project) pe.getProject(1L, "PROJECT", loggedInUser);
			return prj;
		} catch (UnauthorizedException e1) {
			e1.printStackTrace();
			fail("User could not be authorized for retrieving his project");
		}
		return null;
	}

	static public void setupProjectWithCodesystem(Long id, String name, String description, User loggedInUser) {
		CodeSystemTestHelper.addCodeSystem(15648758L, loggedInUser);
		try {
			addProject(id, name, description, 15648758L, loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("Authorization failed for adding a project");
		}


	}

}
