package com.qdacity.test.ExerciseEndpoint;

import static org.junit.Assert.fail;

import java.util.List;

import com.google.api.server.spi.response.UnauthorizedException;
import com.qdacity.endpoint.ExerciseEndpoint;
import com.qdacity.exercise.Exercise;

public class ExerciseEndpointTestHelper {
	static public void addExercise(Long id, Long termCourseID, String name, com.google.appengine.api.users.User loggedInUser) {
		Exercise exercise = new Exercise();
		exercise.setId(id);
		exercise.setName(name);
		exercise.setTermCourseID(termCourseID);
		
		ExerciseEndpoint ee = new ExerciseEndpoint();
		try {
			ee.insertExercise(exercise, loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for exercise creation");
		}
	}
	
	static public void removeExercise(Long id, com.google.appengine.api.users.User loggedInUser) {
		ExerciseEndpoint ee = new ExerciseEndpoint();
		try {
			ee.removeExercise(id, loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User is Not Authorized");
		}
	}
	
	static public List<Exercise> listExercises(Long termCourseID, com.google.appengine.api.users.User loggedInUser) {
		ExerciseEndpoint ee = new ExerciseEndpoint();
		List<Exercise> exercises = null;
		try {
			exercises = ee.listTermCourseExercises(termCourseID, loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for Course Term retrieval");
		}
		return exercises;
	}
	
}
