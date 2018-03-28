package com.qdacity.user;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.jdo.annotations.Column;
import javax.jdo.annotations.Element;
import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import com.google.api.server.spi.config.AnnotationBoolean;
import com.google.api.server.spi.config.ApiResourceProperty;
import com.google.appengine.api.datastore.Blob;
import com.qdacity.course.TermCourse;
import com.qdacity.project.ProjectType;

@PersistenceCapable(identityType = IdentityType.APPLICATION)
public class User implements Serializable {
	/**
	 *
	 */
	private static final long serialVersionUID = 2378677713032476995L;

	@PrimaryKey
	@Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
	String id;

	@Persistent
	UserType type;

	@Persistent
	String givenName;

	@Persistent
	String surName;

	@Persistent
	String email;

	/**
	 * If user uploaded a profile image.
	 * Otherwise empty, dummy is created on client.
	 */
	@Persistent
	Blob profileImg;

	@Persistent
	Long lastProjectId; // Used to pre-load to cache when user signs in

	@Persistent
	ProjectType lastProjectType; // Used to pre-load to cache when user signs in

	@Persistent
	Date lastLogin;

	@Persistent
	List<Long> projects;

	@Persistent
	List<Long> courses;

	@Persistent
	List<Long> termCourses;

	@Persistent
	Long lastCourseId; // Used to pre-load to cache when user signs in

	@Persistent(defaultFetchGroup = "true")
	@Element(dependent = "true")
	@Column(name = "loginProviderInformations")
	List<UserLoginProviderInformation> loginProviderInformationList;

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getGivenName() {
		return givenName;
	}

	public void setGivenName(String givenName) {
		this.givenName = givenName;
	}

	public String getSurName() {
		return surName;
	}

	public void setSurName(String surName) {
		this.surName = surName;
	}

	public Blob getProfileImg() {
		return profileImg;
	}

	public void setProfileImg(Blob profileImg) {
		this.profileImg = profileImg;
	}
	
	public List<Long> getProjects() {
		return projects;
	}

	public void setProjects(List<Long> projects) {
		this.projects = projects;
	}

	public void setCourses(List<Long> courses) {
		this.courses = courses;
	}

	public List<Long> getCourses() {
		return courses;
	}

	public void setTermCourses(List<Long> termCourses) {
		this.termCourses = termCourses;
	}

	public List<Long> getTermCourses() {
		return termCourses;
	}

	public void addProjectAuthorization(Long project) {
		projects.add(project);
	}

	public void removeProjectAuthorization(Long project) {
		projects.remove(project);
	}

	public void addCourseAuthorization(Long course) {
		courses.add(course);
	}

	public void addTermCourseAuthorization(Long termCourseID) {
		if (termCourses == null) {
			termCourses = new ArrayList<Long>();
		}
		termCourses.add(termCourseID);
	}

	public void removeCourseAuthorization(Long course) {
		courses.remove(course);
	}

	public void removeTermCourseAuthorization(Long termCourse) {
		if (termCourses != null) {
			termCourses.remove(termCourse);
		}
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public UserType getType() {
		return type;
	}

	public void setType(UserType type) {
		this.type = type;
	}

	public Long getLastProjectId() {
		return lastProjectId;
	}

	public void setLastProjectId(Long lastProjectId) {
		this.lastProjectId = lastProjectId;
	}

	public Long getLastCourseId() {
		return lastCourseId;
	}

	public void setLastCourseId(Long lastCourseId) {
		this.lastCourseId = lastCourseId;
	}

	public ProjectType getLastProjectType() {
		return lastProjectType;
	}

	public void setLastProjectType(ProjectType lastProjectType) {
		this.lastProjectType = lastProjectType;
	}

	public Date getLastLogin() {
		return lastLogin;
	}

	public void setLastLogin(Date lastLogin) {
		this.lastLogin = lastLogin;
	}

	public void removeLoginProviderInformation(UserLoginProviderInformation loginInfo) {
		loginProviderInformationList.remove(loginInfo);
	}

	public void addLoginProviderInformation(UserLoginProviderInformation loginInfo) {
		if (loginInfo != null) {
			loginProviderInformationList.add(loginInfo);
		}
	}

	public List<UserLoginProviderInformation> getLoginProviderInformation() {
		if(loginProviderInformationList == null) loginProviderInformationList = new ArrayList<UserLoginProviderInformation>();
		return loginProviderInformationList;
	}

	@ApiResourceProperty(ignored = AnnotationBoolean.TRUE) // do not expect from client
	public void setLoginProviderInformation(List<UserLoginProviderInformation> loginProviderInformationList) {
		this.loginProviderInformationList = loginProviderInformationList;
	}
}
