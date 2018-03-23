package com.qdacity.servlet;

import java.io.IOException;
import java.util.logging.Level;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.taskqueue.Queue;
import com.google.appengine.api.taskqueue.QueueFactory;
import com.qdacity.authentication.AuthenticatedUser;
import com.qdacity.endpoint.ProjectEndpoint;
import com.qdacity.endpoint.ProjectStatsEndpoint;
import com.qdacity.endpoint.UserEndpoint;
import com.qdacity.endpoint.UserNotificationEndpoint;
import com.qdacity.endpoint.ValidationEndpoint;
import com.qdacity.project.ProjectType;
import com.qdacity.project.tasks.ProjectDataPreloader;
import com.qdacity.user.LoginProviderType;

public class WarmupServlet extends HttpServlet {

	/**
	 *
	 */
	private static final long serialVersionUID = -8409689949482466830L;
	AuthenticatedUser user;

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException  {
		if (!req.getRequestURI().startsWith("/_ah/warmup")) {
			resp.sendError(404);
			return;
		}

		java.util.logging.Logger.getLogger("logger").log(Level.INFO, " Warming Up");

		user = new AuthenticatedUser("112909287246196217207", "testdummy.smash@gmail.com", LoginProviderType.GOOGLE);

		warmupUserEndpoint(user);

		warmupProjectEndpoint(user);

		warmupProjectStatsEndpoint(user);

		warmupUserNotificationEndpoint(user);

		warmupValidationEndpoint(user);

		warmupProjectDataPreloader();

		resp.setContentType("text/plain");
		resp.getOutputStream().print("warmup finished");

		java.util.logging.Logger.getLogger("logger").log(Level.INFO, " Warmup finished");
	}

	private void warmupProjectDataPreloader() {
		ProjectDataPreloader task = new ProjectDataPreloader(5703572956119040L, ProjectType.PROJECT);
		Queue queue = QueueFactory.getQueue("PreloadQueue");
		queue.add(com.google.appengine.api.taskqueue.TaskOptions.Builder.withPayload(task));
	}

	private void warmupProjectEndpoint(AuthenticatedUser user) {
		ProjectEndpoint pe = new ProjectEndpoint();
		try {
			pe.listProject(null, null, user);
			pe.listValidationProject(user);

			pe.listRevisions(5679105349517312L, user);

		} catch (UnauthorizedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	private void warmupUserEndpoint(AuthenticatedUser user) {
		UserEndpoint ue = new UserEndpoint();

		try {
			ue.getCurrentUser(user);
		} catch (UnauthorizedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}

	private void warmupUserNotificationEndpoint(AuthenticatedUser user) {
		UserNotificationEndpoint une = new UserNotificationEndpoint();
		try {
			une.listUserNotification(null, null, user);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
		}

	}

	private void warmupProjectStatsEndpoint(AuthenticatedUser user) {
		ProjectStatsEndpoint pse = new ProjectStatsEndpoint();

		try {
			pse.getProjectStats(5679105349517312L, "PROJECT", user);
		} catch (UnauthorizedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}

	private void warmupValidationEndpoint(AuthenticatedUser user) {
		ValidationEndpoint ve = new ValidationEndpoint();

		try {
			ve.listReports(5679105349517312L, user);
		} catch (UnauthorizedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}
}
