package com.qdacity.servlet;

import com.google.api.server.spi.auth.common.User;
import com.qdacity.authentication.AuthenticatedUser;
import com.qdacity.endpoint.ExerciseEndpoint;
import com.qdacity.user.LoginProviderType;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class ExerciseDeadlineServlet extends HttpServlet {

	protected void doGet(HttpServletRequest request, HttpServletResponse response) {
		//Todo create an admin user specifically for this cronjob servlet instead of using this account
		User loggedInUser = new AuthenticatedUser("100", "serviceaccount@qdacity.com", LoginProviderType.EMAIL_PASSWORD);
		ExerciseEndpoint ee = new ExerciseEndpoint();
		ee.checkAndCreateExerciseProjectSnapshotsIfNeeded(loggedInUser);
	}
}
