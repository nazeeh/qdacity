package com.qdacity.course;

import java.util.Arrays;
import java.util.List;


import javax.annotation.Nullable;
import javax.inject.Named;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.response.CollectionResponse;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.users.User;
import com.qdacity.Authorization;
import com.qdacity.Constants;
import com.qdacity.PMF;
import com.qdacity.course.Course;



@Api(name = "qdacity",
	version = Constants.VERSION,
	namespace = @ApiNamespace(ownerDomain = "qdacity.com",
		ownerName = "qdacity.com",
		packagePath = "server.project"))
public class CourseEndpoint {

	/**
	 * This method lists all the entities inserted in datastore.
	 * It uses HTTP GET method and paging support.
	 *
	 * @return A CollectionResponse class containing the list of all entities
	 *         persisted and a cursor to the next page.
	 * @throws UnauthorizedException
	 */
	@SuppressWarnings({ "unchecked", "unused" })
	@ApiMethod(name = "course.listCourse",
		path = "courses",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public CollectionResponse<Course> listCourse(@Nullable @Named("cursor") String cursorString, @Nullable @Named("limit") Integer limit, User user) throws UnauthorizedException {

		if (user == null) throw new UnauthorizedException("User not authorized"); // TODO currently no user is authorized to list all courses

		PersistenceManager mgr = null;
		List<Course> execute = null;

		try {
			mgr = getPersistenceManager();

			Query q = mgr.newQuery(Course.class, ":p.contains(owners)");

			execute = (List<Course>) q.execute(Arrays.asList(user.getUserId()));

			// Tight loop for fetching all entities from datastore and accomodate
			// for lazy fetch.
			for (Course obj : execute);
		} finally {
			mgr.close();
		}

		return CollectionResponse.<Course> builder().setItems(execute).setNextPageToken(cursorString).build();
	}

	
	/**
	 * This method removes the entity with primary key id.
	 * It uses HTTP DELETE method.
	 *
	 * @param id the primary key of the entity to be deleted.
	 * @throws UnauthorizedException
	 */
	@SuppressWarnings("unchecked")
	@ApiMethod(name = "course.removeCourse",
		
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public void removeCourse(@Named("id") Long id, User user) throws UnauthorizedException {
		PersistenceManager mgr = getPersistenceManager();
		try {
			Course course = (Course) mgr.getObjectById(Course.class, id);

			// Check if user is authorized
			Authorization.checkAuthorizationCourse(course, user);

			List<String> userIDs = course.getOwners();

			/*
			for (String projectUserIDs : userIDs) {
				com.qdacity.user.User projectUser = mgr.getObjectById(com.qdacity.user.User.class, projectUserIDs);

				projectUser.removeProjectAuthorization(id);
				mgr.makePersistent(projectUser);

			}
			 */
			// Finally remove the actual project
			mgr.deletePersistent(course);
		} finally {
			mgr.close();
		}
	}
	

	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}

}
