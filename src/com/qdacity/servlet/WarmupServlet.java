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
import com.google.api.server.spi.auth.common.User;
import com.qdacity.endpoint.ProjectEndpoint;
import com.qdacity.endpoint.ProjectStatsEndpoint;
import com.qdacity.endpoint.UserEndpoint;
import com.qdacity.endpoint.UserNotificationEndpoint;
import com.qdacity.endpoint.ValidationEndpoint;
import com.qdacity.project.ProjectType;
import com.qdacity.project.tasks.ProjectDataPreloader;

public class WarmupServlet extends HttpServlet {

	/**
	 * 
	 */
	private static final long serialVersionUID = -8409689949482466830L;
	User user;

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		if (!req.getRequestURI().startsWith("/_ah/warmup")) {
			resp.sendError(404);
			return;
		}

		java.util.logging.Logger.getLogger("logger").log(Level.INFO, " Warming Up");

		user = new User("112909287246196217207", "testdummy.smash@gmail.com");

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

	private void warmupProjectEndpoint(User user) {
		ProjectEndpoint pe = new ProjectEndpoint();
		try {
			pe.listProject(null, null, user);
			pe.listValidationProject(user);

			pe.listRevisions(5703572956119040L, user);

		} catch (UnauthorizedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	private void warmupUserEndpoint(User user) {
		UserEndpoint ue = new UserEndpoint();

		try {
			ue.getCurrentUser(user);
		} catch (UnauthorizedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}

	private void warmupUserNotificationEndpoint(User user) {
		UserNotificationEndpoint une = new UserNotificationEndpoint();

		une.listUserNotification(null, null, user);
	}

	private void warmupProjectStatsEndpoint(User user) {
		ProjectStatsEndpoint pse = new ProjectStatsEndpoint();

		try {
			pse.getProjectStats(5703572956119040L, "PROJECT", user);
		} catch (UnauthorizedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}

	private void warmupValidationEndpoint(User user) {
		ValidationEndpoint ve = new ValidationEndpoint();

		try {
			ve.listReports(5703572956119040L, user);
		} catch (UnauthorizedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}
}
