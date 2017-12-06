


export default class AuthorizationProvider {

    /**
	 * Gets the current user from qdacity server.
	 *
   * @returns {Promise}
   */
	getCurrentUser() {
        var promise = new Promise(
          function (resolve, reject) {
            gapi.client.qdacity.user.getCurrentUser().execute(function (resp) {
              if (!resp.code) {
                resolve(resp);
              } else {
                reject(resp);
              }
            });
          }
        );
        return promise;
    }
    
    isProjectOwner(user, prjId) {
        var isOwner = false;
        if (typeof user.projects !== 'undefined') {
            user.projects.forEach(function (userPrjId) {
                if (userPrjId === prjId) isOwner = true;
            });
        }
        return isOwner;
    }

    isCourseOwner(user, courseID) {
        var isOwner = false;
        if (typeof user.courses != 'undefined') {
            isOwner = ((user.courses.indexOf(courseID) == -1) ? false : true);
        }
        return isOwner;
    }

    isValidationCoder(user, valPrj) {
        var isValidationCoder = false;
        if (typeof valPrj.validationCoders !== 'undefined') {
            valPrj.validationCoders.forEach(function (valCoderId) {
                if (user.id === valCoderId) isValidationCoder = true;
            });
        }
        return isValidationCoder;
    }

    /**
     * Registers the current user.
     * The user has to be logged in beforehand.
     *
     * @param givenName
     * @param surName
     * @param email
     * @returns {Promise}
     */
    registerCurrentUser(givenName, surName, email) {
        var promise = new Promise(
            function (resolve, reject) {
                var user = {};
                user.email = email;
                user.givenName = givenName;
                user.surName = surName;

                gapi.client.qdacity.insertUser(user).execute(function (resp) {
                    if (!resp.code) {
                        resolve(resp);
                    } else {
                        reject(resp);
                    }
                });
            }
        );

        return promise;
    }
}