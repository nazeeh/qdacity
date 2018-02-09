export default class AuthorizationProvider {
  isProjectOwner(user, prjId) {
    var isOwner = false;
    if (typeof user.projects !== "undefined") {
      user.projects.forEach(function(userPrjId) {
        if (userPrjId === prjId) isOwner = true;
      });
    }
    return isOwner;
  }

  isCourseOwner(user, courseID) {
    var isOwner = false;
    if (typeof user.courses != "undefined") {
      isOwner = user.courses.indexOf(courseID) == -1 ? false : true;
    }
    return isOwner;
  }

  isTermCourseOwner(user, termCourseID) {
    var isOwner = false;
    if (typeof user.termCourses != "undefined") {
      isOwner = user.termCourses.indexOf(termCourseID) == -1 ? false : true;
    }
    return isOwner;
  }

  isValidationCoder(user, valPrj) {
    var isValidationCoder = false;
    if (typeof valPrj.validationCoders !== "undefined") {
      valPrj.validationCoders.forEach(function(valCoderId) {
        if (user.id === valCoderId) isValidationCoder = true;
      });
    }
    return isValidationCoder;
  }
}
