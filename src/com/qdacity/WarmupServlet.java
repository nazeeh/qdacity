package com.qdacity;

import java.io.IOException;
import java.util.logging.Level;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.users.User;
import com.qdacity.project.ProjectEndpoint;
import com.qdacity.user.UserEndpoint;
import com.qdacity.user.UserNotificationEndpoint;

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

		user = new User("testdummy.smash@gmail.com", "", "112909287246196217207");

		warmupUserEndpoint(user);
		
		warmupProjectEndpoint(user);

		warmupUserNotificationEndpoint(user);

		resp.setContentType("text/plain");
		resp.getOutputStream().print("warmup finished");

		java.util.logging.Logger.getLogger("logger").log(Level.INFO, " Warmup finished");
	}

	private void warmupProjectEndpoint(User user) {
		ProjectEndpoint pe = new ProjectEndpoint();
		try {
			pe.listProject(null, null, user);
			pe.listValidationProject(user);
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
}
