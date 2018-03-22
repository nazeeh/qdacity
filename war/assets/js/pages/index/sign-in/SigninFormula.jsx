//@ts-check
import React from 'react';
import styled from 'styled-components';

import { FormattedMessage } from 'react-intl';
import IntlProvider from '../../../common/Localization/LocalizationProvider';

import ReactLoading from '../../../common/ReactLoading.jsx';

import { BtnLg } from '../../../common/styles/Btn.jsx';
import StyledInput from '../../../common/styles/Input.jsx';
import SigninWithGoogleBtn from './SigninWithGoogleBtn.jsx';
import VexModal from '../../../common/modals/VexModal';

const PanelDivisor = styled.div`
	margin-top: 15px;
	margin-bottom: 15px;
	height: 1px;
	border: 1px solid
`;

const FormulaHeading = styled.p`
	text-align: left;
	margin-bottom: 2px;
	margin-top: 5px;
	margin-left: 30px;
`;

const FormulaLink = styled.a`
	color: inherit;
	font-size: 15px;
	margin-top: 5px;
	margin-left: 10px;
	margin-right: 10px;
`;

const Spacer = styled.div`
	margin-top: 15px;
`;

const ButtonStyledWidh = styled.div`
	margin-top: 4px;
	width:  100%;
	& > button {
		width: 70%;
		border: 1px solid ${props => props.theme.borderDefault};
	}
`;

const FormulaInputWrapper = styled.div`
	width: 100%;
	& > input {
		width: 80%;
		color: ${props => props.theme.defaultText}
	}
`;

export default class SigninFormula extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			loading: false,
			emailInput: '',
			passwordInput: ''
		};

		// init vex (workaround)
		new VexModal()

	}

	async signInWithEmailPassword() {
		console.log('Sign in with Email and password called!');

		await this.props.auth.authentication.signInWithEmailPassword(this.state.emailInput, this.state.passwordInput);
		this.props.auth.updateUserStatus();
		this.props.history.push('/PersonalDashboard');
	}

	forgotPassword() {
		console.log('Forgot your password?');
	}

	registerEmailPassword() {
		console.log('Register with email and password.');
		const _this = this;
		
		const { formatMessage } = IntlProvider.intl;

		const firstNameLabel = formatMessage({
			id: 'index.registeremailpwd.first_name',
			defaultMessage: 'First Name'
		});
		const lastNameLabel = formatMessage({
			id: 'index.registeremailpwd.last_name',
			defaultMessage: 'Last Name'
		});
		const emailLabel = formatMessage({
			id: 'index.registeremailpwd.email',
			defaultMessage: 'Email'
		});
		const passwordLabel = formatMessage({
			id: 'index.registeremailpwd.pwd',
			defaultMessage: 'Password'
		});
		vex.dialog.open({
			message: formatMessage({
				id: 'index.registeremailpwd.registerHeading',
				defaultMessage: 'Register a new QDACity Account!'
			}),
			input: [
				`<label for="firstName">${firstNameLabel}</label><input name="firstName" type="text" placeholder="${firstNameLabel}" required />`,
				`<label for="lastName">${lastNameLabel}</label><input name="lastName" type="text" placeholder="${lastNameLabel}" required />`,
				`<label for="email">${emailLabel}</label><input name="email" type="text" placeholder="${emailLabel}" required />`,
				`<label for="pwd">${passwordLabel}</label><input name="pwd" type="password" placeholder="${passwordLabel}" required />`
			].join('\n'),
			buttons: [
				$.extend({}, vex.dialog.buttons.YES, {
					text: formatMessage({
						id: 'index.registeremailpwd.registerCompleteButton',
						defaultMessage: 'Register'
					})
				}),
				$.extend({}, vex.dialog.buttons.NO, {
					text: formatMessage({
						id: 'index.registeremailpwd.registerCancelButton',
						defaultMessage: 'Cancel'
					})
				})
			],
			callback: async function(data) {
				if (data === false) {
					return console.log('Cancelled');
				}
				// TODO call backend!
				await _this.props.auth.authentication.registerUserEmailPassword(data.email, data.pwd, data.firstName, data.lastName);
				await _this.props.auth.authentication.signInWithEmailPassword(data.email, data.pwd);
				await _this.props.auth.updateUserStatus();
				_this.props.history.push('/PersonalDashboard');

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

	render() {
		if (this.state.loading) return <ReactLoading />;
		return (
            <div>
                <h3>
                    <FormattedMessage
                        id="signin-formula.title"
                        defaultMessage="Sign in now!"
                    />
                </h3>
                <div id="email-pwd-signin">
                    <div className="row">
                        <div className="col-xs-12">
                            <FormulaHeading>
                                <FormattedMessage
                                    id="signin-formula.email"
                                    defaultMessage="Email:"
                                />	
                            </FormulaHeading>
                        </div>
                        <div className="col-xs-12">
                            <FormulaInputWrapper>
                                <StyledInput onChange={(event) => this.state.emailInput = event.target.value}/>
                            </FormulaInputWrapper>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-xs-12">
                            <FormulaHeading>
                                <FormattedMessage
                                    id="signin-formula.pwd"
                                    defaultMessage="Password:"
                                />	
                            </FormulaHeading>
                        </div>
                        <div className="col-xs-12">
                            <FormulaInputWrapper>
                                <StyledInput type="password" onChange={(event) => this.state.passwordInput = event.target.value}/>
                            </FormulaInputWrapper>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-xs-6">
                            <FormulaLink onClick={() => this.forgotPassword()}><u>
                                <FormattedMessage
                                    id="signin-formula.forgotpw"
                                    defaultMessage="Forgot PW?"
                                />	
                            </u></FormulaLink>
                        </div>
                        <div className="col-xs-6">
                            <FormulaLink id="signin-formula-register-link" href="#" onClick={() => this.registerEmailPassword()}><u>
                                <FormattedMessage
                                    id="signin-formula.register-email-pwd"
                                    defaultMessage="Register now!"
                                />	
                            </u></FormulaLink>
                        </div>
                    </div>
                    <Spacer/>
                    <div className="row">
                        <ButtonStyledWidh>
                            <BtnLg onClick={() => this.signInWithEmailPassword()}>
                                <a>
                                    <i className="fa fa-sign-in fa-2x" />
                                </a>
                                <span>
                                    <FormattedMessage
                                        id="signin-formula.signin-email-pwd"
                                        defaultMessage="Sign in"
                                    />
                                </span>
                            </BtnLg>
                        </ButtonStyledWidh>
                    </div>
                </div>

                <PanelDivisor/>

                <div id="social-signin">
                    <div className="row">
                        <h4>
                            <FormattedMessage
                                id="signin-formula.signin-social-heading"
                                defaultMessage="Sign in / Register with social Accounts"
                            />
                        </h4>
                    </div>
                    <div className="row">
                        <ButtonStyledWidh>
                            <SigninWithGoogleBtn auth={this.props.auth} history={this.props.history}/>
                        </ButtonStyledWidh>
                    </div>
                </div>
            </div>
		);
	}
}
