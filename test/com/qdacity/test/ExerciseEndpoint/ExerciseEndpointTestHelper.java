package com.qdacity.test.ExerciseEndpoint;

import static org.junit.Assert.fail;

import java.util.List;

import com.google.api.server.spi.response.UnauthorizedException;
import com.qdacity.endpoint.ExerciseEndpoint;
import com.qdacity.exercise.Exercise;

public class ExerciseEndpointTestHelper {
	static public void addExercise(Long termCourseID, String name, com.google.appengine.api.users.User loggedInUser) {
		Exercise exercise = new Exercise();
		exercise.setName(name);

		ExerciseEndpoint ee = new ExerciseEndpoint();
		try {
			ee.insertExercise(termCourseID, exercise, loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for exercise creation");
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
