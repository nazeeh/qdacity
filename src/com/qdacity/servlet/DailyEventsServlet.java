package com.qdacity.servlet;

import com.qdacity.logs.EventLogger;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class DailyEventsServlet extends HttpServlet {

	protected void doGet(HttpServletRequest request, HttpServletResponse response) {
		EventLogger.logDailyUserLogins();
	}

}
