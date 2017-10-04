package com.qdacity.test.CourseEndpoint;

import com.google.api.server.spi.response.UnauthorizedException;
import com.qdacity.endpoint.CourseEndpoint;
import com.qdacity.course.Course;
import com.qdacity.course.TermCourse;

public class CourseEndpointTestHelper {
	static public void addCourse(Long id, String name, String description, com.google.appengine.api.users.User loggedInUser) throws UnauthorizedException {
		Course course = new Course();
		course.setId(id);
		course.setName(name);
		course.setDescription(description);

		CourseEndpoint ue = new CourseEndpoint();
		ue.insertCourse(course, loggedInUser);
	}
	
	static public void removeCourse(Long id, com.google.appengine.api.users.User loggedInUser) throws UnauthorizedException {
		CourseEndpoint ue = new CourseEndpoint();
		ue.removeCourse(id, loggedInUser);
	}
	
	static public Course getCourse(Long id, com.google.appengine.api.users.User loggedInUser) throws UnauthorizedException {
		CourseEndpoint ce = new CourseEndpoint();
		return ce.getCourse(id, loggedInUser);
	}
	
	static public void addTermCourse(Long id, Long CourseID, String term, com.google.appengine.api.users.User loggedInUser) throws UnauthorizedException {
		TermCourse termCourse = new TermCourse();
		termCourse.setId(id);
		termCourse.setCourseTemplateID(CourseID);
		
		CourseEndpoint ce = new CourseEndpoint();
		ce.insertTermCourse(CourseID, term, termCourse, loggedInUser);
	}

}
