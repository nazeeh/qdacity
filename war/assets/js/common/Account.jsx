import React from 'react';
import AuthenticationProvider from './AuthenticationProvider';

import {
	BtnDefault,
	BtnPrimary
} from './styles/Btn.jsx';

export default class Account extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			name: '',
			email: '',
			picSrc: ''
		};
		this.authenticationProvider = new AuthenticationProvider();

		this.redirectToPersonalDashbaord = this.redirectToPersonalDashbaord.bind(this);

		this.props.callback(this);

		var _this = this;

		// always keep the profile data up-to-date
		this.authenticationProvider.addAuthStateListener(function() {
			if (!_this.isSignedIn()) {
				// no authentication happend yet.
				return;
			}
			_this.updateToken();
			_this.getProfile().then(function(userProfile) {
				_this.setUser(userProfile);
			});
		});

		// on page reloads: also reload profile data		
		if(this.isSignedIn()) {
			_this.updateToken();
			_this.getProfile().then(function(userProfile) {
				_this.setUser(userProfile);
			});
		} else {
			// try silent sign in
			_this.authenticationProvider.silentSignInWithGoogle();
		}
	}

  /**
	 * Fetches the id token and passes it into gapi.
	 *
   * @returns {Promise}
   */
	updateToken () {
		return this.authenticationProvider.synchronizeTokenWithGapi();
  }

  /**
	 * Redirects to the personal dashboard
   */
  redirectToPersonalDashbaord() {
    this.props.history.push('/PersonalDashboard');
	}

  /**
	 * Does the sign-in process by a popup. Provides gapi with the received id token.
   * @returns {Promise}
   */
	signIn() {
		var _this = this;
    var promise = new Promise(
      function (resolve, reject) {
        _this.authenticationProvider.signInWithGoogle().then(function () {
          _this.updateToken();
          resolve();
        }).catch(function (err) {
          console.log('The login failed!!');
          console.log(err);
          reject();
        });
      });
		return promise;
  }

  /**
   * Loggs out the current user and starts the sign in process for a new user.
   *
   * @param callback
   * @returns {Promise}
   */
  changeAccount() {
		var _this = this;
    var promise = new Promise(
      function (resolve, reject) {
				_this.signout().then(function() {
					_this.signIn().then(function() {
						resolve();
					}, function(err) {
						console.log('Error at changing Account!');
						reject(err);
					})
				}, function(err) {
					console.log('Error at changing Account!');
					reject(err);
				});
			});
		return promise;
  }

  /**
	 * Gets the current user's profile data from the authentcation provider.
	 *
   * @returns {Promise}
   */
	getProfile() {
		return this.authenticationProvider.getProfile();
	}

  /**
	 * Checks if there is a user signed in.
	 *
   * @returns {boolean}
   */
	isSignedIn() {
		return this.authenticationProvider.isSignedIn();
	}

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

  /**
	 * Sets profile data into state.
	 * (This data is used in order to display email adress and image of the user)
	 *
   * @param pProfile
   */
	setUser(pProfile) {
		this.setState({
			name: pProfile.displayName,
			email: pProfile.email,
			picSrc: pProfile.thumbnail
		});
	}

  /**
	 * Signs out of the session and cleans the profile data in the state.
   * @returns {Promise}
   */
	signout() {
    var _this = this;
    var promise = new Promise(
      function (resolve, reject) {
        _this.authenticationProvider.signOut().then(function () {
          _this.setState({
            name: '',
            email: '',
            picSrc: ''
          });
          resolve();
        }, function (error) {
          console.log('Error at signing out!');
          console.log(error);
          reject();
        });
      });

    return promise;
	}

	/**
	 * whenever the auth state changes, the given fkt will be executed.
	 * @param {*} fkt 
	 */
	addAuthStateListener(fkt) {
		this.authenticationProvider.addAuthStateListener(fkt);
	}

	render() {
		return (
			<div>
				<div className="navbar-content">
					<div className="row">
						<div className="col-xs-3">
							<img id="currentUserPicture" src={this.state.picSrc} alt="" className="img-responsive" />
							<p className="text-center small">
							</p>
						</div>
						<div className="col-xs-9">
							<span id="currentUserName">{this.state.name}</span>
							<p id="currentUserEmail" className="text-muted small">{this.state.email}</p>
							<div className="divider"></div>
							<BtnPrimary onClick={this.redirectToPersonalDashbaord}>Personal Dashboard</BtnPrimary>
						</div>
					</div>
				</div>
				<div className="navbar-footer">
					<div className="navbar-footer-content">
						<div className="row">
							<div className="col-xs-6">
								<BtnDefault id="navBtnSwitchAccount"  href="#" className="btn btn-default btn-sm" onClick={() => this.changeAccount().then(() => location.reload())}>Switch User</BtnDefault>
							</div>
							<div className="col-xs-6">
								<BtnDefault id="navBtnSignOut" className="btn btn-default btn-sm pull-right" onClick={() => this.signout().then(() => { this.props.history.push('/'); location.reload(); })}>Sign Out</BtnDefault>
							</div>
						</div>
					</div>
				</div>
			</div>

		);
	}
}