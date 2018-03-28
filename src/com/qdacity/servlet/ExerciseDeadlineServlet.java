package com.qdacity.servlet;

import com.qdacity.endpoint.ExerciseEndpoint;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class ExerciseDeadlineServlet extends HttpServlet {

	protected void doGet(HttpServletRequest request, HttpServletResponse response) {
		ExerciseEndpoint.createExerciseProjectSnapshotsIfNeeded();
	}

}
