package com.qdacity.test.CourseEndpoint;

import static org.junit.Assert.fail;

import java.util.List;

import com.google.api.server.spi.response.CollectionResponse;
import com.google.api.server.spi.response.UnauthorizedException;
import com.qdacity.endpoint.CourseEndpoint;
import com.qdacity.course.Course;
import com.qdacity.course.TermCourse;

public class CourseEndpointTestHelper {
	static public void addCourse(Long id, String name, String description, com.google.appengine.api.users.User loggedInUser) {
		Course course = new Course();
		course.setId(id);
		course.setName(name);
		course.setDescription(description);

		CourseEndpoint ue = new CourseEndpoint();
		try {
			ue.insertCourse(course, loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for course creation");
		}
	}
	
	static public void removeCourse(Long id, com.google.appengine.api.users.User loggedInUser) {
		CourseEndpoint ue = new CourseEndpoint();
		try {
			ue.removeCourse(id, loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User is Not Authorized");
		}
	}
	
	static public Course getCourse(Long id, com.google.appengine.api.users.User loggedInUser) {
		CourseEndpoint ce = new CourseEndpoint();
		Course course = new Course();
		try {
			course = ce.getCourse(id, loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for Course retrieval");
		}
		return course;
	}
	
	static public TermCourse getTermCourse(Long id, com.google.appengine.api.users.User loggedInUser) {
		CourseEndpoint ce = new CourseEndpoint();
		TermCourse termCourse = new TermCourse();
		try {
			termCourse = ce.getTermCourse(id, loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for Course retrieval");
		}
		return termCourse;
	}
	
	static public void removeTermCourse(Long id, com.google.appengine.api.users.User loggedInUser) {
		CourseEndpoint ue = new CourseEndpoint();
		try {
			ue.removeTermCourse(id, loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User is Not Authorized");
		}
	}
	
	static public List<TermCourse> listTermCourse(Long courseID, com.google.appengine.api.users.User loggedInUser) {
		CourseEndpoint ce = new CourseEndpoint();
		List<TermCourse> terms = null;
		try {
			terms = ce.listTermCourse(courseID, loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for Course Term retrieval");
		}
		
		return terms;
	}
	
	static public void addTermCourse(Long id, Long courseID, String term, com.google.appengine.api.users.User loggedInUser) {
		TermCourse termCourse = new TermCourse();
		termCourse.setId(id);
		termCourse.setCourseID(courseID);
		
		CourseEndpoint ce = new CourseEndpoint();
		try {
			ce.insertTermCourse(courseID, term, termCourse, loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for term creation");
		}
	}
	
	static public void addTermCourse(Long termCourseId, com.google.appengine.api.users.User loggedInUser) {
		TermCourse termCourse = new TermCourse();
		termCourse.setId(termCourseId);

		CourseEndpoint ue = new CourseEndpoint();
		try {
			ue.insertTermCourse(termCourseId, "WS", termCourse, loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for term course creation");
		}
	}
	
	static public void setTermCourseStatus(Long termCourseId,boolean isOpen, com.google.appengine.api.users.User loggedInUser) {
		TermCourse termCourse = new TermCourse();
		termCourse.setOpen(isOpen);

		CourseEndpoint ue = new CourseEndpoint();
		try {
			ue.setTermCourseStatus(termCourseId, isOpen, loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for term course creation");
		}
	}
	
	static public void addParticipantTermCourse(Long termCourseID, String userID, com.google.appengine.api.users.User loggedInUser) {
		CourseEndpoint ue = new CourseEndpoint();
		
		try {
			ue.addParticipant(termCourseID, userID, loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for term course participation");
		}
	}
	
	static public void removeParticipantTermCourse(Long termCourseID, String userID, com.google.appengine.api.users.User loggedInUser) {
		CourseEndpoint ue = new CourseEndpoint();
		
		try {
			ue.removeParticipant(termCourseID, userID, loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for term course participation");
		}
	}
	
	static public CollectionResponse<Course> listCourse(com.google.appengine.api.users.User loggedInUser) {
		CourseEndpoint ce = new CourseEndpoint();
		CollectionResponse<Course> courses = null;
		try {
			courses = ce.listCourse(null, null, loggedInUser);
		} catch (UnauthorizedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return courses;
	}

	static public void removeUser(Long courseID, com.google.appengine.api.users.User loggedInUser) {
		CourseEndpoint ce = new CourseEndpoint();
		try {
			ce.removeUser(courseID, loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for Course removal");
		}
	}
}
