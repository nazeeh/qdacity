import React from 'react'
import { FormattedMessage } from 'react-intl';
import IntlProvider from '../../common/Localization/LocalizationProvider';
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
		const {formatMessage} = IntlProvider.intl;
		var that = this;
		this.props.account.getCurrentUser().then(function (value) {
			that.props.history.push('/PersonalDashboard');
		}, function (value) {
			var acc = that.props.account;
			var decider = new BinaryDecider(
				formatMessage({ id: 'sign.in.with.google.btn.register_prompt', defaultMessage: 'Your account does not seem to be registered with QDAcity.' }),
				formatMessage({ id: 'sign.in.with.google.btn.use_different', defaultMessage: 'Use Different Account' }),
				formatMessage({ id: 'sign.in.with.google.btn.register_account', defaultMessage: 'Register Account' })
			);
			decider.showModal().then(function (value) {
				if (value == 'optionA') that.props.account.changeAccount(that.redirect);
				else that.registerAccount();
			});
		});
	}

	registerAccount() {
		const {formatMessage} = IntlProvider.intl;
		var _this = this;
		var googleProfile = _this.props.account.getProfile();
		vex.dialog.open({
			message: formatMessage({ id: 'sign.in.with.google.btn.confirm', defaultMessage: 'Please confirm:' }),
			// FIXME
			input: '<label for"firstName">First Name</label><input name="firstName" type="text" placeholder="First Name" value="' + googleProfile.getGivenName() + '" required />'
				+ '<label for"lastName">Last Name</label><input name="lastName" type="text" placeholder="Last Name" value="' + googleProfile.getFamilyName() + '" required />\n'
				+ '<label for"email">Email</label><input name="email" type="text" placeholder="Email" value="' + googleProfile.getEmail() + '" required />\n\n',
			buttons: [
				$.extend({}, vex.dialog.buttons.YES, {
					text: formatMessage({ id: 'sign.in.with.google.btn.register', defaultMessage: 'Register' })
				}), $.extend({}, vex.dialog.buttons.NO, {
					text: formatMessage({ id: 'sign.in.with.google.btn.cancel', defaultMessage: 'Cancel' })
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

	}

	signIn() {
		this.setState({
			loading: true
		});

		if (this.props.account.isSignedIn()) {
			this.redirect();
		} else {
			this.props.account.changeAccount(this.redirect);
		}
	}

	render() {
		if (this.state.loading) return <ReactLoading />;
		return (
			<BtnLg href="#" onClick={() => this.signIn()}>

					<a>
						<i className="fa fa-google fa-2x"></i>
					</a>
					<span><FormattedMessage id='sign.in.with.google.btn.sign_in_with_google' defaultMessage='Sign in with Google' /></span>
			</BtnLg>
		);
	}
}