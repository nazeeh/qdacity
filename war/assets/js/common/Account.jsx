import React from 'react';
import { FormattedMessage } from 'react-intl';

import {
	BtnDefault,
	BtnPrimary
} from './styles/Btn.jsx';
export default class Account extends React.Component {


	constructor(props) {
		super(props);
		this.state = {
			name: "",
			email: "",
			picSrc: ""
		};
		this.auth2 = gapi.auth2.init({
			client_id: this.props.client_id,
			scope: this.props.scope
		});
		this.signin();

		this.redirectToPersonalDashbaord = this.redirectToPersonalDashbaord.bind(this);
	}

	redirectToPersonalDashbaord() {
		this.props.history.push('/PersonalDashboard');
	}

	signin() {
		var _this = this;
		this.auth2.currentUser.listen(function (googleUser) {
			if (googleUser.isSignedIn()) {
				_this.setUser(_this.getProfile());
				_this.props.callback(_this);
			} else {
				_this.props.callback(_this);
			}
		});
		_this.props.callback(_this);
	}


	changeAccount(callback) {
		this.auth2.signIn({
			'prompt': 'select_account'
		}).then(callback);
	}

	getProfile() {
		return this.auth2.currentUser.get().getBasicProfile();
	}

	isSignedIn() {
		return this.auth2.isSignedIn.get();
	}

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
		if (typeof user.projects != 'undefined') {
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

	isTermCourseOwner(user, termCourseID) {
		var isOwner = false;
		if (typeof user.termCourses != 'undefined') {
			isOwner = ((user.termCourses.indexOf(termCourseID) == -1) ? false : true);
		}
		return isOwner;
	}

	isValidationCoder(user, valPrj) {
		var isValidationCoder = false;
		if (typeof valPrj.validationCoders != 'undefined') {
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
		window.open("https://accounts.google.com/logout");
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
							<BtnPrimary onClick={this.redirectToPersonalDashbaord}><FormattedMessage id='account.personal_dashboard' defaultMessage='Personal Dashboard' /></BtnPrimary>
						</div>
					</div>
				</div>
				<div className="navbar-footer">
					<div className="navbar-footer-content">
						<div className="row">
							<div className="col-xs-6">
								<BtnDefault id="navBtnSwitchAccount"  href="#" className="btn btn-default btn-sm" onClick={this.changeAccount.bind(this)}><FormattedMessage id='account.switch_user' defaultMessage='Switch User' /></BtnDefault>
							</div>
							<div className="col-xs-6">
								<BtnDefault id="navBtnSignOut" className="btn btn-default btn-sm pull-right" onClick={this.signout.bind(this)}><FormattedMessage id='account.sign_out' defaultMessage='Sign Out' /></BtnDefault>
							</div>
						</div>
					</div>
				</div>
			</div>

		);
	}
}