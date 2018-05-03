package com.qdacity;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;

import javax.jdo.PersistenceManager;
import javax.jdo.Query;

import com.google.api.server.spi.auth.common.User;
import com.google.api.server.spi.response.UnauthorizedException;
import com.qdacity.authentication.AuthenticatedUser;
import com.qdacity.course.Course;
import com.qdacity.course.TermCourse;
import com.qdacity.endpoint.CourseEndpoint;
import com.qdacity.endpoint.UserEndpoint;
import com.qdacity.metamodel.MetaModelEntity;
import com.qdacity.metamodel.MetaModelRelation;
import com.qdacity.project.Project;
import com.qdacity.project.ValidationProject;
import com.qdacity.project.codesystem.Code;
import com.qdacity.project.codesystem.CodeSystem;
import com.qdacity.project.data.TextDocument;
import com.qdacity.umleditor.UmlCodePosition;
import com.qdacity.user.UserGroup;
import com.qdacity.user.UserType;

public class Authorization {

	private static UserEndpoint userEndpoint = new UserEndpoint();
	private static CourseEndpoint courseEndpoint = new CourseEndpoint();

	public static Boolean isUserAuthorized(User googleUser, Long projectID) throws UnauthorizedException {
		PersistenceManager mgr = getPersistenceManager();
		try {
			// Check if user is Authorized
			Project project = (Project) Cache.getOrLoad(projectID, Project.class);

			if (project == null) {
				throw new UnauthorizedException("Project " + projectID + " was not found");
			}

			com.qdacity.user.User qdacityUser = userEndpoint.getCurrentUser(googleUser);
			List<Long> userGroupList = project.getOwningUserGroups();
			int sizeBefore = userGroupList.size();
			if(userGroupList.removeAll(qdacityUser.getUserGroups())) {
				// size decreased if user is in matching usergroup
				if(userGroupList.size() < sizeBefore) return true;
			}

			if (project.getOwners().contains(qdacityUser.getId())) return true;
		} finally {
			mgr.close();
		}


		return false;
	}

	public static Boolean isUserAuthorizedCourse(User googleUser, Course course) throws UnauthorizedException {
		PersistenceManager mgr = getPersistenceManager();
		try {
			com.qdacity.user.User qdacityUser = userEndpoint.getCurrentUser(googleUser);

			boolean userIsInvited = false;
			if (course.getInvitedUsers() != null) {
				if (!course.getInvitedUsers().isEmpty()) userIsInvited = course.getInvitedUsers().contains(qdacityUser.getId());
			}

			if (course.getOwners() != null && course.getOwners().contains(qdacityUser.getId()) ||
					qdacityUser.getType() == UserType.ADMIN ||
					userIsInvited) {
				return true;
			}

			List<Long> userGroupList = course.getOwningUserGroups();
			int sizeBefore = userGroupList.size();
			if(userGroupList.removeAll(qdacityUser.getUserGroups())) {
				// size decreased if user is in matching usergroup
				if(userGroupList.size() < sizeBefore) return true;
			}
		} finally {
			mgr.close();
		}
		return false;
	}


	public static Boolean isUserAuthorizedTermCourse(User loggedInUser, TermCourse termCourse) throws UnauthorizedException {
		PersistenceManager mgr = getPersistenceManager();
		try {
			String authenticatedUserId = userEndpoint.getCurrentUser(loggedInUser).getId();

			com.qdacity.user.User courseUser = mgr.getObjectById(com.qdacity.user.User.class, authenticatedUserId);
			if (termCourse.getParticipants() != null) {
				if (termCourse.getParticipants().contains(authenticatedUserId) || termCourse.getOwners().contains(authenticatedUserId) || courseUser.getType() == UserType.ADMIN) return true;
			}
			else {
				if (termCourse.getOwners().contains(authenticatedUserId) || courseUser.getType() == UserType.ADMIN) return true;
			}

			Long associatedCourseId = termCourse.getCourseID();
			Course course = courseEndpoint.getCourse(associatedCourseId, loggedInUser);
			return isUserAuthorizedCourse(loggedInUser, course); // also checks authorization with user groups
		} finally {
			mgr.close();
		}
	}

	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}

	public static void checkAuthorization(TextDocument textDocument, User user) throws UnauthorizedException {
		isUserNotNull(user);

		Boolean authorized = Authorization.isUserAuthorized(user, textDocument.getProjectID());
		if (!authorized) throw new UnauthorizedException("User is Not Authorized");
	}

	public static void checkAuthorization(UmlCodePosition umlCodePosition, User user) throws UnauthorizedException {

		PersistenceManager mgr = getPersistenceManager();
		try {

			CodeSystem cs = mgr.getObjectById(CodeSystem.class, umlCodePosition.getCodesystemId());

			Authorization.checkAuthorization(cs, user);

		} finally {
			mgr.close();
		}
	}

	public static void checkAuthorization(Code code, User user) throws UnauthorizedException {

		PersistenceManager mgr = getPersistenceManager();
		try {

			CodeSystem cs = mgr.getObjectById(CodeSystem.class, code.getCodesystemID());

			Authorization.checkAuthorization(cs, user);

		} finally {
			mgr.close();
		}
	}

	public static void checkAuthorization(CodeSystem codesystem, User user) throws UnauthorizedException {
		Authorization.checkAuthorization(codesystem.getProject(), user);
	}

	public static void checkAuthorization(Project project, User user) throws UnauthorizedException {
		isUserNotNull(user);
		Boolean authorized = Authorization.isUserAuthorized(user, project.getId());
		if (!authorized) throw new UnauthorizedException("User is Not Authorized");

	}

	public static void checkAuthorizationCourse(Course course, User user) throws UnauthorizedException {
		isUserNotNull(user);
		Boolean authorized = Authorization.isUserAuthorizedCourse(user, course);
		if (!authorized) throw new UnauthorizedException("User is Not Authorized");
	}

	public static void checkAuthorizationTermCourse(TermCourse termCourse, User user) throws UnauthorizedException {
		isUserNotNull(user);
		Boolean authorized = Authorization.isUserAuthorizedTermCourse(user, termCourse);
		if (!authorized) throw new UnauthorizedException("User is Not Authorized");
	}

	public static void checkAuthTermCourseParticipation(TermCourse termCourse, String userID ,User user) throws UnauthorizedException {
		isUserNotNull(user);

		PersistenceManager mgr = getPersistenceManager();
		try {
			String authenticatedUserId = userEndpoint.getCurrentUser(user).getId();

			com.qdacity.user.User adder = mgr.getObjectById(com.qdacity.user.User.class, authenticatedUserId);
			if (!termCourse.isOpen()) {
				if (!(termCourse.getOwners().contains(adder.getId()) || adder.getType() == UserType.ADMIN)) throw new UnauthorizedException("User is not authorized for adding participants");
			}
			else if (!(adder.getId().equals(userID) || termCourse.getOwners().contains(adder.getId()))) {
				throw new UnauthorizedException("User is not authorized for adding other participants");
			}
		} finally {
			mgr.close();
		}
	}

	public static void checkAuthTermCourseUserRemoval(TermCourse termCourse, String userID ,User user) throws UnauthorizedException {
		isUserNotNull(user);

		PersistenceManager mgr = getPersistenceManager();
		try {
			String authenticatedUserId = userEndpoint.getCurrentUser(user).getId();

			com.qdacity.user.User remover = mgr.getObjectById(com.qdacity.user.User.class, authenticatedUserId);
			if (!remover.getId().equals(userID))
				{
					if (!(termCourse.getOwners().contains(remover.getId()) || remover.getType() == UserType.ADMIN)) throw new UnauthorizedException("User is not authorized for removing participants");
				}
			else if (!termCourse.getParticipants().contains(remover.getId())) throw new UnauthorizedException("User is not a participant in this term course");
		} finally {
			mgr.close();
		}
	}

	public static void checkAuthorization(Long projectID, User user) throws UnauthorizedException {
		isUserNotNull(user);
		Boolean authorized = Authorization.isUserAuthorized(user, projectID) || isUserAdmin(user);
		if (!authorized) throw new UnauthorizedException("User is Not Authorized");

	}

	public static boolean isUserRegistered (com.qdacity.user.User user) throws UnauthorizedException {
		PersistenceManager mgr = getPersistenceManager();

		Query q = mgr.newQuery(com.qdacity.user.User.class);
		q.setFilter("id == theID");
		q.declareParameters("String theID");

		try {
		  @SuppressWarnings("unchecked")
		List<com.qdacity.user.User> users = (List<com.qdacity.user.User>) q.execute(user.getId());
		  if (!users.isEmpty()) {
		    	com.qdacity.user.User thisUser = users.get(0);
				if (thisUser.getId() == user.getId()) return true;
		  } else {
			  throw new UnauthorizedException("User " +  user.getId() + " was not found");
		  }
		} finally {
		  q.closeAll();
		}

		return false;
	}

	public static void checkAuthorization(com.qdacity.user.User userRequested, User userLoggedIn) throws UnauthorizedException {
		isUserNotNull(userLoggedIn);
		String authenticatedUserId = null;

		authenticatedUserId = userEndpoint.getCurrentUser(userLoggedIn).getId();

		Boolean authorized = (authenticatedUserId.equals(userRequested.getId()));
		Boolean isAdmin = isUserAdmin(userLoggedIn);
		if (!authorized) throw new UnauthorizedException("User " + authenticatedUserId + " is Not Authorized");
		Boolean userUpdatesSelf = (authenticatedUserId.equals(userRequested.getId()));
		if (!userUpdatesSelf && !isAdmin) throw new UnauthorizedException("User " + authenticatedUserId + " is not authorized to update a user other than himself");
		if (userRequested.getType() == UserType.ADMIN && !isAdmin) throw new UnauthorizedException("Non admin user tried to set ADMIN status");
	}

	public static void checkAuthorization(MetaModelEntity metaModelEntity, User userLoggedIn) throws UnauthorizedException {
		isUserNotNull(userLoggedIn);

		Boolean allowed = isUserAdmin(userLoggedIn);

		if (!allowed) throw new UnauthorizedException("User is Not Authorized");
	}

	public static void checkAuthorization(MetaModelRelation metaModelRelation, User userLoggedIn) throws UnauthorizedException {
		isUserNotNull(userLoggedIn);

		Boolean allowed = isUserAdmin(userLoggedIn);

		if (!allowed) throw new UnauthorizedException("User is Not Authorized");
	}

	public static AuthorizationLevel checkAuthorization(ValidationProject project, com.qdacity.user.User user) throws UnauthorizedException {
		isUserNotNull(user);

		if (user.getType() == UserType.ADMIN) return AuthorizationLevel.ADMIN;

		Boolean isValidationCoder = project.getValidationCoders().indexOf(user.getId()) != -1;
		if (isValidationCoder) return AuthorizationLevel.VALIDATIONCODER;

		Project parentProject = (Project) Cache.getOrLoad(project.getProjectID(), Project.class);

		Boolean isProjectOwner = parentProject.getOwners().contains(user.getId());
		if (isProjectOwner) return AuthorizationLevel.CODER;
		java.util.logging.Logger.getLogger("logger").log(Level.INFO, user.getId() + " is not owner of project " + parentProject.getId());
		throw new UnauthorizedException("User is Not Authorized.");
	}

	/**
	 * Checks if requesting user is admin or owner of the user group
	 * @param userGroup
	 * @param loggedInUser
	 * @throws UnauthorizedException if not
	 */
	public static void checkAuthorization(UserGroup userGroup, User loggedInUser) throws UnauthorizedException {
		isUserNotNull(loggedInUser);

		com.qdacity.user.User user = Cache.getOrLoadUserByAuthenticatedUser((AuthenticatedUser) loggedInUser);

		Boolean isOwner = userGroup.getOwners().contains(user.getId());
		Boolean isAdmin = isUserAdmin(loggedInUser);

		if(!isOwner && !isAdmin) throw new UnauthorizedException("Only group owners and admins are allowed to perform this operation!");
	}

	public static Boolean isUserAdmin(User loggedinUser) throws UnauthorizedException {
		com.qdacity.user.User user = userEndpoint.getCurrentUser(loggedinUser);
		if (user.getType() == UserType.ADMIN) return true;
		return false;
	}

	public static void checkDatabaseInitalizationAuthorization(User userLoggedIn) throws UnauthorizedException {
		isUserNotNull(userLoggedIn);

		Boolean allowed = isUserAdmin(userLoggedIn);

		if (!allowed) throw new UnauthorizedException("User is Not Authorized");
	}

	public static void isUserNotNull(Object userLoggedIn) throws UnauthorizedException {
		if (userLoggedIn == null) throw new UnauthorizedException("User is Not Valid");
	}
}
