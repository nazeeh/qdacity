package com.qdacity.test.ExerciseEndpoint;

import static org.junit.Assert.fail;

import java.util.List;

import com.google.api.server.spi.response.UnauthorizedException;
import com.qdacity.endpoint.ExerciseEndpoint;
import com.qdacity.exercise.Exercise;
import com.qdacity.exercise.ExerciseProject;

public class ExerciseEndpointTestHelper {
	static public void addExercise(Long id, Long termCourseID, String name, com.google.api.server.spi.auth.common.User loggedInUser) {
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
	
	static public void removeExercise(Long id, com.google.api.server.spi.auth.common.User loggedInUser) {
		ExerciseEndpoint ee = new ExerciseEndpoint();
		try {
			ee.removeExercise(id, loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User is Not Authorized");
		}
	}
	
	static public List<Exercise> listExercises(Long termCourseID, com.google.api.server.spi.auth.common.User loggedInUser) {
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
	
	
	static public void createExerciseProject(Long revisionID, Long exerciseID, com.google.api.server.spi.auth.common.User loggedInUser) {
		
		ExerciseEndpoint ee = new ExerciseEndpoint();
		try {
			ee.createExerciseProject(revisionID, exerciseID, loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for exercise project creation");
		}
	}
	
static public void createExerciseProjectIfNeeded(Long revisionID, Long exerciseID, com.google.api.server.spi.auth.common.User loggedInUser) {
		
		ExerciseEndpoint ee = new ExerciseEndpoint();
		try {
			ee.createExerciseProjectIfNeeded(revisionID, exerciseID, loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for exercise project creation");
		}
	}
	
	static public ExerciseProject getExerciseProjectByRevisionID(Long revisionID, com.google.api.server.spi.auth.common.User loggedInUser) {
		ExerciseEndpoint ee = new ExerciseEndpoint();
		ExerciseProject exerciseProject = null;
		try {
			exerciseProject = ee.getExerciseProjectByRevisionID(revisionID, loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for Course Term retrieval");
		}
		return exerciseProject;
	}

	static public List<ExerciseProject> getExerciseProjectsByExerciseID(Long exerciseID, com.google.api.server.spi.auth.common.User loggedInUser) {
		ExerciseEndpoint ee = new ExerciseEndpoint();
		List<ExerciseProject> exerciseProjects = null;
		try {
			exerciseProjects = ee.getExerciseProjectsByExerciseID(exerciseID, loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for Course Term retrieval");
		}
		return exerciseProjects;
	}
}
