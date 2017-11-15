/* eslint-disable indent,semi,space-before-function-paren,no-multiple-empty-lines,no-mixed-spaces-and-tabs,no-trailing-spaces */
import React from 'react';
import firebaseWrapper from './firebase';

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
		this.auth_google = firebaseWrapper.googleAuthProvider;
		this.firebase = firebaseWrapper.firebase;

		this.redirectToPersonalDashbaord = this.redirectToPersonalDashbaord.bind(this);

		this.props.callback(this);

		var _this = this;
		this.firebase.auth().onAuthStateChanged(function() {
			if (!_this.isSignedIn()) {
					// no authentication happend yet.
				return;
			}
			_this.updateToken();
		});
	}

  /**
	 * Fetches the id token from firebase and passes it into gapi.
	 *
   * @returns {Promise}
   */
	updateToken () {
		var _this = this
		var promise = new Promise(
      function (resolve, reject) {
        _this.firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then(function (idToken) {
					gapi.client.setToken({access_token: idToken});
					resolve();
				}).catch(function (error) {
					console.log('Retrieved no token!');
					console.log(error);
					reject();
				});
			});
		return promise
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
	signin() {
		var _this = this;
		var promise = new Promise(
      		function (resolve, reject) {
       			 _this.firebase.auth().signInWithPopup(_this.auth_google).then(function(result) {
								_this.setUser(_this.getProfile());
								_this.updateToken().then(function() {
									resolve();
								}, function() {
									reject();
								})
				}).catch(function(error) {
					  console.log('The login failed!!');
					  console.log(error);
					  reject();
				});
		 	}
		);
    	return promise;
  }

  /**
	 * Signes in a user and invokes callback() after that.
	 *
   * @param callback
   */
	signInWithCallback(callback) {
		this.signin().then(function(result) {
			callback();
		});
	}

  /**
	 * Loggs out the current user and starts the sign in process for a new user.
	 * After completion, the callback method is invoked.
	 *
   * @param callback
   */
	changeAccount(callback) {
		this.signout();
		this.signInWithCallback(callback);
	}

  /**
	 * Gets the current user's profile data with following members:
	 * displayName
	 * email
	 * photoURL
	 * emailVerified
	 * uid
   * @returns {firebase.User | any}
   */
	getProfile() {
		// TODO: check calling libs if follow attributes match existing called
		return this.firebase.auth().currentUser;
	}

  /**
	 * Checks if there is a user signed into firebase.
	 *
   * @returns {boolean}
   */
	isSignedIn() {
		return !!this.firebase.auth().currentUser;
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
	 * The user has to be logged in with firebase beforehand.
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

	setUser(pProfile) {
		this.setState({
			name: pProfile.displayName,
			email: pProfile.email,
			picSrc: pProfile.photoURL
		});
	}

	signout() {
		var _this = this;
    this.firebase.auth().signOut().then(function() {
			_this.setState({
				name: '',
				email: '',
				picSrc: ''
			});
    }).catch(function(error) {
      console.log('Error at signing out!');
      console.log(error);
    });
	}

	render() {
		return (
			<div>
				<div className="navbar-content">
					<div className="row">
						<div className="col-xs-5">
							<img id="currentUserPicture" src={this.state.picSrc} alt="" className="img-responsive" />
							<p className="text-center small">
							</p>
						</div>
						<div className="col-xs-7">
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
								<BtnDefault id="navBtnSwitchAccount"  href="#" className="btn btn-default btn-sm" onClick={this.changeAccount.bind(this)}>Switch User</BtnDefault>
							</div>
							<div className="col-xs-6">
								<BtnDefault id="navBtnSignOut" className="btn btn-default btn-sm pull-right" onClick={this.signout.bind(this)}>Sign Out</BtnDefault>
							</div>
						</div>
					</div>
				</div>
			</div>

		);
	}
}