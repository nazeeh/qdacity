//@ts-check
import React from 'react';
import styled from 'styled-components';

import { FormattedMessage } from 'react-intl';
import IntlProvider from '../../../common/Localization/LocalizationProvider';

import ReactLoading from '../../../common/ReactLoading.jsx';
import BinaryDecider from '../../../common/modals/BinaryDecider.js';

import { BtnLg } from '../../../common/styles/Btn.jsx';

export default class SigninWithGoogleBtn extends React.Component {
	constructor(props) {
		super(props);

		this.authenticationProvider = props.auth.authentication;
		this.state = {
			loading: false
		};
	}

	onSignedIn() {
		if (!this.props.onSignedIn) {
			console.error('No onSignedIn method given in SigninWithGoogleBtn.');
			return;
		}
		this.props.onSignedIn();
	}

	registerAccount(googleProfile) {
		const { formatMessage } = IntlProvider.intl;

		const esc = text =>
			text.replace(
				/([&<>"'` !@$%()[\]=+{}])/g,
				code => `&#${code.charCodeAt(0)};`
			);
		const displayNameParts = googleProfile.name.split(' ');
		const lastName = esc(displayNameParts.pop());
		const firstName = esc(displayNameParts.join(' '));
		const email = esc(googleProfile.email);

		const firstNameLabel = formatMessage({
			id: 'signinwithgooglebtn.first_name',
			defaultMessage: 'First Name'
		});
		const lastNameLabel = formatMessage({
			id: 'signinwithgooglebtn.last_name',
			defaultMessage: 'Last Name'
		});
		const emailLabel = formatMessage({
			id: 'signinwithgooglebtn.email',
			defaultMessage: 'Email'
		});

		const _this = this;

		vex.dialog.open({
			message: formatMessage({
				id: 'sign.in.with.google.btn.confirm',
				defaultMessage: 'Please confirm:'
			}),
			input: [
				`<label for="firstName">${firstNameLabel}</label><input name="firstName" type="text" placeholder="${firstNameLabel}" value="${firstName}" required />`,
				`<label for="lastName">${lastNameLabel}</label><input name="lastName" type="text" placeholder="${lastNameLabel}" value="${lastName}" required />`,
				`<label for="email">${emailLabel}</label><input name="email" type="text" placeholder="${emailLabel}" value="${email}" required />`
			].join('\n'),
			buttons: [
				$.extend({}, vex.dialog.buttons.YES, {
					text: formatMessage({
						id: 'sign.in.with.google.btn.register',
						defaultMessage: 'Register'
					})
				}),
				$.extend({}, vex.dialog.buttons.NO, {
					text: formatMessage({
						id: 'sign.in.with.google.btn.cancel',
						defaultMessage: 'Cancel'
					})
				})
			],
			callback: function(data) {
				if (data === false) {
					_this.setState({
						loading: false
					});
					return console.log('Cancelled');
				}
				_this.authenticationProvider
					.registerGoogleUser(data.firstName, data.lastName, data.email)
					.then(function() {
						_this.props.auth.updateUserStatus().then(function() {
							_this.onSignedIn();
						});
					});
				return console.log(
					'First',
					data.firstName,
					'Last Name',
					data.lastName,
					'Email',
					data.email
				);
			}
		});
	}

	signIn() {
		const { formatMessage } = IntlProvider.intl;

		this.setState({
			loading: true
		});

		const _this = this;
		this.authenticationProvider.signInWithGoogle().then(
			function(googleProfile) {
				_this.onSignedIn();
			},
			function(googleProfileOrError) {
				if (googleProfileOrError.error) {
					// on google error
					_this.setState({
						loading: false
					});
					return;
				}

				var decider = new BinaryDecider(
					formatMessage({
						id: 'sign.in.with.google.btn.register_prompt',
						defaultMessage:
							'Your account does not seem to be registered with QDAcity.'
					}),
					formatMessage({
						id: 'sign.in.with.google.btn.use_different',
						defaultMessage: 'Use Different Account'
					}),
					formatMessage({
						id: 'sign.in.with.google.btn.register_account',
						defaultMessage: 'Register Account'
					})
				);
				decider.showModal().then(function(value) {
					if (value == 'optionA') {
						_this.signIn();
					} else {
						_this.registerAccount(googleProfileOrError);
					}
				});
			}
		);
	}

	render() {
		if (this.state.loading)
			return <ReactLoading color={props => props.theme.defaultText} />;
		return (
			<BtnLg href="#" onClick={() => this.signIn()}>
				<a>
					<i className="fa fa-google fa-2x" />
				</a>
				<span>
					<FormattedMessage
						id="sign.in.with.google.btn.sign_in_with_google"
						defaultMessage="Sign in with Google"
					/>
				</span>
			</BtnLg>
		);
	}
}
