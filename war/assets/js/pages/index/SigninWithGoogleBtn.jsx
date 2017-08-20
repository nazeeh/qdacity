import React from 'react'
import styled from 'styled-components';

import ReactLoading from '../../common/ReactLoading.jsx';
import BinaryDecider from '../../common/modals/BinaryDecider.js';


const StyledBtnText = styled.span `
    font-size: 18px;
`;

const StyledBtnLabel = styled.span `
	color: rgba(0, 0, 0, 1.0);
`;

const StyledSigninBtn = styled.a `
    background-color: rgba(255, 255, 255, 0.4);
	border-width: 1px;
	border-color: #fff;
	&:hover {
        background-color: rgba(255, 255, 255, 1.0);
		border-color: #fff;
    }
`;

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
			var acc = that.props.account;
			var decider = new BinaryDecider('Your account does not seem to be registered with QDAcity. What would you like me to do?', 'Use Different Account', 'Register Account');
			decider.showModal().then(function (value) {
				if (value == 'optionA') that.props.account.changeAccount(that.redirect);
				else that.registerAccount();
			});
		});
	}

	registerAccount() {
		var _this = this;
		var googleProfile = _this.props.account.getProfile();
		vex.dialog.open({
			message: 'Please confirm:',
			input: '<label for"firstName">First Name</label><input name="firstName" type="text" placeholder="First Name" value="' + googleProfile.getGivenName() + '" required />'
				+ '<label for"lastName">Last Name</label><input name="lastName" type="text" placeholder="Last Name" value="' + googleProfile.getFamilyName() + '" required />\n'
				+ '<label for"email">Email</label><input name="email" type="text" placeholder="Email" value="' + googleProfile.getEmail() + '" required />\n\n',
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
				_this.props.account.registerCurrentUser(data.firstName, data.lastName, data.email).then(this.redirect);
				return console.log('First', data.firstName, 'Last Name', data.lastName, 'Email', data.email);
			}
		});

	}

	signIn() {
		this.setState({
			loading: true
		});
		$('#signinGoogleBtn').hide();
		$('.signin').css("display", "inline-block");

		if (this.props.account.isSignedIn()) {
			this.redirect();
		} else {
			this.props.account.changeAccount(this.redirect);
		}
	}


	render() {
		if (this.state.loading) return <ReactLoading />;
		return (
			<StyledSigninBtn id="signinGoogleBtn" className="btn btn-default" href="#" onClick={() => this.signIn()}>
				<StyledBtnLabel>
					<i className="fa fa-google fa-2x pull-left"></i>
					<StyledBtnText>Sign in with Google</StyledBtnText>
				</StyledBtnLabel>
			</StyledSigninBtn>
		);
	}
}