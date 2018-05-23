package com.qdacity.test.ExerciseEndpoint;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import java.util.Date;
import java.util.List;

import com.google.api.server.spi.auth.common.User;
import com.google.api.server.spi.response.CollectionResponse;
import com.google.api.server.spi.response.UnauthorizedException;
import com.qdacity.endpoint.ExerciseEndpoint;
import com.qdacity.endpoint.ProjectEndpoint;
import com.qdacity.endpoint.TextDocumentEndpoint;
import com.qdacity.endpoint.datastructures.TextDocumentCodeContainer;
import com.qdacity.exercise.Exercise;
import com.qdacity.exercise.ExerciseGroup;
import com.qdacity.exercise.ExerciseProject;
import com.qdacity.project.ProjectRevision;
import com.qdacity.project.ProjectType;
import com.qdacity.project.data.TextDocument;
import com.qdacity.test.ProjectEndpoint.ProjectEndpointTestHelper;
import com.qdacity.test.TextDocumentEndpointTest.TextDocumentEndpointTestHelper;
import com.qdacity.test.ValidationEndpoint.ValidationEndpointTestHelper;


public class ExerciseEndpointTestHelper {
	static public void addExercise(Long id, Long termCourseID, String name, Date deadline, com.google.api.server.spi.auth.common.User loggedInUser) {
		Exercise exercise = new Exercise();
		exercise.setId(id);
		exercise.setName(name);
		exercise.setTermCourseID(termCourseID);
		exercise.setExerciseDeadline(deadline);
		ExerciseEndpoint ee = new ExerciseEndpoint();
		try {
			ee.insertExercise(exercise, loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for exercise creation");
		}
	}

	static public void createAndInsertExerciseToExerciseGroup(Long id, Long termCourseID, String name, Date deadline, Long exerciseGroupID, com.google.api.server.spi.auth.common.User loggedInUser) {
		Exercise exercise = new Exercise();
		exercise.setId(id);
		exercise.setName(name);
		exercise.setTermCourseID(termCourseID);
		exercise.setExerciseDeadline(deadline);
		ExerciseEndpoint ee = new ExerciseEndpoint();
		try {
			ee.createAndInsertExerciseToExerciseGroup(exercise, exerciseGroupID, loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for exercise creation");
		}
	}
    static public void insertExerciseGroup(Long id, Long termCourseID, String name, com.google.api.server.spi.auth.common.User loggedInUser) {
        ExerciseGroup exerciseGroup = new ExerciseGroup();
        exerciseGroup.setId(id);
        exerciseGroup.setName(name);
        exerciseGroup.setTermCourseID(termCourseID);
        ExerciseEndpoint ee = new ExerciseEndpoint();
        try {
            ee.insertExerciseGroup(exerciseGroup, loggedInUser);
        } catch (UnauthorizedException e) {
            e.printStackTrace();
            fail("User could not be authorized for exercise creation");
        }
    }

	static public void addExerciseGroup(Long id, Long projectRevisionID, Long termCourseID, String name, List<String> exerciseIDs, Long exerciseProjectID,  com.google.api.server.spi.auth.common.User loggedInUser) {
		ExerciseGroup exerciseGroup = new ExerciseGroup();
		exerciseGroup.setId(id);
		exerciseGroup.setProjectRevisionID(projectRevisionID);
		exerciseGroup.setExerciseProjectID(exerciseProjectID);
		exerciseGroup.setName(name);
		exerciseGroup.setTermCourseID(termCourseID);
		exerciseGroup.setExercises(exerciseIDs);
		ExerciseEndpoint ee = new ExerciseEndpoint();
		try {
			ee.insertExerciseGroup(exerciseGroup, loggedInUser);
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

    static public List<ExerciseGroup> listTermCourseExerciseGroups(Long termCourseID, com.google.api.server.spi.auth.common.User loggedInUser) {
        ExerciseEndpoint ee = new ExerciseEndpoint();
        List<ExerciseGroup> exerciseGroups = null;
        try {
            exerciseGroups = ee.listTermCourseExerciseGroups(termCourseID, loggedInUser);
        } catch (UnauthorizedException e) {
            e.printStackTrace();
            fail("User could not be authorized for Course Term retrieval");
        }
        return exerciseGroups;
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
	
	static public ExerciseProject getExerciseProjectByRevisionID(Long revisionID, Long exerciseID, com.google.api.server.spi.auth.common.User loggedInUser) {
		ExerciseEndpoint ee = new ExerciseEndpoint();
		ExerciseProject exerciseProject = null;
		try {
			exerciseProject = ee.getExerciseProjectByRevisionID(revisionID, exerciseID, loggedInUser);
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


	public static String originalText = "<p><coding id=\"1\" code_id=\"1\">First paragraph</coding></p><p><coding id=\"2\" code_id=\"1\">Second paragraph</coding></p><p>Third paragraph</p><p>Fourth paragraph</p><p>Fifth paragraph</p><p>Sixth paragraph</p><p>Seventh paragraph</p><p>Eighth paragraph</p>";
	public static String recodedText = "<p><coding id=\"1\" code_id=\"1\">First paragraph</coding></p><p>Second paragraph</p><p>Third paragraph</p><p>Fourth paragraph</p><p>Fifth paragraph</p><p>Sixth paragraph</p><p>Seventh paragraph</p><p>Eighth paragraph</p>";

	static public ExerciseProject setUpExerciseProject(User testUser, User validationCoderA, User validationCoderB, Long exerciseID, Long codeSystemID, Long projectID) {
		ProjectEndpointTestHelper.setupProjectWithCodesystem(codeSystemID, "My Project", "I'm testing this to evaluate a revision", testUser);
		TextDocumentEndpointTestHelper.addTextDocument(projectID, ValidationEndpointTestHelper.originalText, "Test Document", testUser);

		ProjectEndpoint pe = new ProjectEndpoint();
		ExerciseEndpoint ee = new ExerciseEndpoint();
		try {
			ProjectRevision revision = pe.createSnapshot(projectID, "A test revision", testUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User failed to be authorized for creating a snapshot");
		}

		List<ProjectRevision> revisions;
		try {
			revisions = pe.listRevisions(projectID, testUser);
			Long revID = revisions.get(0).getId();

            ExerciseProject exprjA = ee.createExerciseProject(revID, exerciseID, validationCoderA);

            ExerciseProject exprjB = ee.createExerciseProject(revID, exerciseID, validationCoderB);

			TextDocumentEndpoint tde = new TextDocumentEndpoint();
			TextDocumentCodeContainer textDocumentCode = new TextDocumentCodeContainer();
			CollectionResponse<TextDocument> docs = tde.getTextDocument(exprjA.getId(), ProjectType.EXERCISE, testUser);
			assertEquals(1, docs.getItems().size());

			docs = tde.getTextDocument(exprjB.getId(), ProjectType.EXERCISE, testUser);
			assertEquals(1, docs.getItems().size());

			return exprjA;
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("Failed authorization for creating a exerciseProject");
		}
		return null;
	}
}
