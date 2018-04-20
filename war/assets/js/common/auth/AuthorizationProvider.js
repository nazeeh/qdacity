export default class AuthorizationProvider {
	isProjectOwner(user, prj) {
		var isOwner = false;
		if (typeof user.projects !== 'undefined') {
			user.projects.forEach(function(userPrjId) {
				if (userPrjId === prj.id) isOwner = true;
			});
		}

		if(prj.owningUserGroups !== undefined && prj.owningUserGroups !== null
			&& user.userGroups !== undefined && user.userGroups !== null) {

			prj.owningUserGroups.forEach(function(userGroup) {
				if(user.userGroups.includes(userGroup)) isOwner = true;
			});
		}
		return isOwner;
	}

	isCourseOwner(user, course) {
		var isOwner = false;
		if (typeof user.courses != 'undefined') {
			isOwner = user.courses.indexOf(course.id) == -1 ? false : true;
		}

		if(course.owningUserGroups !== undefined && course.owningUserGroups !== null
			&& user.userGroups !== undefined && user.userGroups !== null) {

			course.owningUserGroups.forEach(function(userGroup) {
				if(user.userGroups.includes(userGroup)) isOwner = true;
			});
		}
		return isOwner;
	}

	isTermCourseOwner(user, termCourse, parentCourse) {
		var isOwner = false;
		if (typeof user.termCourses != 'undefined' && user.termCourses.indexOf(termCourse.id) != -1) {
			return true;
		}

		return this.isCourseOwner(user, parentCourse);
	}

	isValidationCoder(user, valPrj) {
		var isValidationCoder = false;
		if (typeof valPrj.validationCoders !== 'undefined') {
			valPrj.validationCoders.forEach(function(valCoderId) {
				if (user.id === valCoderId) isValidationCoder = true;
			});
		}
		return isValidationCoder;
	}
}
