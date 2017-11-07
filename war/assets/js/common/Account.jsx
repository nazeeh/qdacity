/* eslint-disable indent,semi,space-before-function-paren,no-multiple-empty-lines */
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
	}

	redirectToPersonalDashbaord() {
		this.props.history.push('/PersonalDashboard');
	}

	signin() {
		var _this = this;
		var promise = new Promise(
      function (resolve, reject) {
        _this.firebase.auth().signInWithPopup(_this.auth_google).then(function(result) {
          if (result.credential) {
            var token = result.credential.accessToken;
            gapi.client.setToken({access_token: token});
            resolve(result.user)
          } else {
            console.log('Retrieved no token!');
            reject();
          }
        }).catch(function(error) {
          console.log('The login failed!!');
          reject();
        });
      }
    );

    return promise;
  }

  signInWithCallback(callback) {
		this.signin().then(function(result) {
			callback();
		});
	}


	changeAccount(callback) {
		this.signout();
		this.signInWithCallback(callback);
	}

	getProfile() {
		// TODO: check calling libs if follow attributes match existing called
		// user.displayName
		// user.email
		// user.photoURL
		// user.emailVerified
		// user.uid
		return this.firebase.auth().currentUser;
	}

	isSignedIn() {
		return !!this.firebase.auth().currentUser;
	}

	getCurrentUser() {
		var _this = this;
		var promise = new Promise(
			function (resolve, reject) {
        var user = _this.firebase.auth().currentUser;
				if (user) {
					resolve(user);
				} else {
					reject(user);
				}
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
			name: pProfile.getName(),
			email: pProfile.getEmail(),
			picSrc: pProfile.getImageUrl()
		});
	}

	signout() {
    this.firebase.auth().signOut().then(function() {
			this.setState({
				name: '',
				email: '',
				picSrc: ''
			});
    }).catch(function(error) {
      console.log('Error at signing out!');
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