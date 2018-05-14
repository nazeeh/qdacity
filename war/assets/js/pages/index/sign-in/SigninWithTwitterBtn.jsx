//@ts-check
import React from 'react';
import styled from 'styled-components';

import { FormattedMessage } from 'react-intl';
import IntlProvider from '../../../common/Localization/LocalizationProvider';

import ReactLoading from '../../../common/ReactLoading.jsx';
import BinaryDecider from '../../../common/modals/BinaryDecider.js';

import { BtnLg } from '../../../common/styles/Btn.jsx';

export default class SigninWithTwitterBtn extends React.Component {
	constructor(props) {
		super(props);

		this.authenticationProvider = props.auth.authentication;
		this.state = {
			loading: false
		};
	}

	onSignedIn() {
		if (!this.props.onSignedIn) {
			console.error('No onSignedIn method given in SigninWithTwitterBtn.');
			return;
		}
		this.props.onSignedIn();
	}

	registerAccount(twitterProfile) {
		const { formatMessage } = IntlProvider.intl;

		const esc = text =>
			text.replace(
				/([&<>"'` !@$%()[\]=+{}])/g,
				code => `&#${code.charCodeAt(0)};`
			);
		const displayNameParts = twitterProfile.name.split(' ');
		const lastName = esc(displayNameParts.pop());
		const firstName = esc(displayNameParts.join(' '));
		const email = esc(twitterProfile.email || '');

		const firstNameLabel = formatMessage({
			id: 'signinwithtwitterbtn.first_name',
			defaultMessage: 'First Name'
		});
		const lastNameLabel = formatMessage({
			id: 'signinwithtwitterbtn.last_name',
			defaultMessage: 'Last Name'
		});
		const emailLabel = formatMessage({
			id: 'signinwithtwitterbtn.email',
			defaultMessage: 'Email'
		});

		const _this = this;

		vex.dialog.open({
			message: formatMessage({
				id: 'signinwithtwitterbtn.confirm',
				defaultMessage: 'Please confirm:'
			}),
			// FIXME
			input: [
				`<label for="firstName">${firstNameLabel}</label><input name="firstName" type="text" placeholder="${firstNameLabel}" value="${firstName}" required />`,
				`<label for="lastName">${lastNameLabel}</label><input name="lastName" type="text" placeholder="${lastNameLabel}" value="${lastName}" required />`,
				`<label for="email">${emailLabel}</label><input name="email" type="text" placeholder="${emailLabel}" value="${email}" required />`
			].join('\n'),
			buttons: [
				$.extend({}, vex.dialog.buttons.YES, {
					text: formatMessage({
						id: 'signinwithtwitterbtn.register',
						defaultMessage: 'Register'
					})
				}),
				$.extend({}, vex.dialog.buttons.NO, {
					text: formatMessage({
						id: 'signinwithtwitterbtn.cancel',
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
					.registerTwitterUser(data.firstName, data.lastName, data.email)
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
		this.authenticationProvider.signInWithTwitter().then(
			function(twitterProfile) {
				_this.onSignedIn();
			},
			function(twitterProfileOrError) {
				if (twitterProfileOrError.error) {
					// on twitter error
					_this.setState({
						loading: false
					});
					return;
				}

				var decider = new BinaryDecider(
					formatMessage({
						id: 'signinwithtwitterbtn.register_prompt',
						defaultMessage:
							'Your account does not seem to be registered with QDAcity.'
					}),
					formatMessage({
						id: 'signinwithtwitterbtn.use_different',
						defaultMessage: 'Use Different Account'
					}),
					formatMessage({
						id: 'signinwithtwitterbtn.register_account',
						defaultMessage: 'Register Account'
					})
				);
				decider.showModal().then(function(value) {
					if (value == 'optionA') {
						_this.signIn();
					} else {
						_this.registerAccount(twitterProfileOrError);
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
					<i className="fa fa-twitter fa-2x" />
				</a>
				<span>
					<FormattedMessage
						id="signinwithtwitterbtn.sign_in_with_twitter"
						defaultMessage="Sign in with Twitter"
					/>
				</span>
			</BtnLg>
		);
	}
}
