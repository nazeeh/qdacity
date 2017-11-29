import React from 'react'
import styled from 'styled-components';

import ReactLoading from '../../common/ReactLoading.jsx';
import BinaryDecider from '../../common/modals/BinaryDecider.js';

import {
	BtnLg
} from '../../common/styles/Btn.jsx';

export default class SigninWithGoogleBtn extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false
		};

		this.redirect = this.redirect.bind(this);
	}


	redirect() {
		var that = this;
		this.props.account.getCurrentUser().then(function (value) {
			that.props.history.push('/PersonalDashboard');
		}, function (value) {
			var decider = new BinaryDecider('Your account does not seem to be registered with QDAcity.', 'Use Different Account', 'Register Account');
			decider.showModal().then(function (value) {
				if (value == 'optionA'){
          that.props.account.changeAccountWithCallback.then(function() {
          	that.redirect();
          });
				}
				else that.registerAccount();
			});
		});
	}

	registerAccount() {
		var _this = this;
		_this.props.account.getProfile().then(function(userProfile) {

			var displayNameParts = userProfile.name.split(' ');
			var displayLastName = displayNameParts.pop();
			var displayFirstName = displayNameParts.join(' ');
	
			vex.dialog.open({
				message: 'Please confirm:',
				input: '<label for"firstName">First Name</label><input name="firstName" type="text" placeholder="First Name" value="' + displayFirstName + '" required />'
					+ '<label for"lastName">Last Name</label><input name="lastName" type="text" placeholder="Last Name" value="' + displayLastName + '" required />\n'
					+ '<label for"email">Email</label><input name="email" type="text" placeholder="Email" value="' + userProfile.email + '" required />\n\n',
				buttons: [
					$.extend({}, vex.dialog.buttons.YES, {
						text: 'Register'
					}), $.extend({}, vex.dialog.buttons.NO, {
						text: 'Cancel'
					})
				],
				callback: function (data) {
					if (data === false) {
						return console.log('Cancelled');
					}
					_this.props.account.registerCurrentUser(data.firstName, data.lastName, data.email).then(_this.redirect);
					return console.log('First', data.firstName, 'Last Name', data.lastName, 'Email', data.email);
				}
			});
		});
	}

	signIn() {
		this.setState({
			loading: true
		});

		if (this.props.account.isSignedIn()) {
			this.redirect();
		} else {
			var _this = this;
			this.props.account.signIn().then(function() {
				_this.redirect();
      		});
		}
	}

	render() {
		if (this.state.loading) return <ReactLoading />;
		return (
			<BtnLg href="#" onClick={() => this.signIn()}>

					<a>
						<i className="fa fa-google fa-2x"></i>
					</a>
					<span>Sign in with Google</span>
			</BtnLg>
		);
	}
}