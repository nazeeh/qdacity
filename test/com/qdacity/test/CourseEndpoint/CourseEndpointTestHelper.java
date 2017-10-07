package com.qdacity.test.CourseEndpoint;

import java.util.List;

import com.google.api.server.spi.response.CollectionResponse;
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
	
	static public List<TermCourse> listTermCourse(Long courseID, com.google.appengine.api.users.User loggedInUser) throws UnauthorizedException {
		CourseEndpoint ce = new CourseEndpoint();
		return ce.listTermCourse(courseID, loggedInUser);
	}
	
	static public void addTermCourse(Long id, Long courseID, String term, com.google.appengine.api.users.User loggedInUser) throws UnauthorizedException {
		TermCourse termCourse = new TermCourse();
		termCourse.setId(id);
		termCourse.setCourseID(courseID);
		
		CourseEndpoint ce = new CourseEndpoint();
		ce.insertTermCourse(courseID, term, termCourse, loggedInUser);
	}
	static public CollectionResponse<Course> listCourse(com.google.appengine.api.users.User loggedInUser) throws UnauthorizedException {
		CourseEndpoint ce = new CourseEndpoint();
		return ce.listCourse(null, null, loggedInUser);
	}

	static public void removeUser(Long courseID, com.google.appengine.api.users.User loggedInUser) throws UnauthorizedException {
		CourseEndpoint ce = new CourseEndpoint();
		ce.removeUser(courseID, loggedInUser);
	}
}
