//@ts-check
import React from 'react';
import styled from 'styled-components';

import { FormattedMessage } from 'react-intl';
import IntlProvider from '../../../common/Localization/LocalizationProvider';

import ReactLoading from '../../../common/ReactLoading.jsx';

import { BtnLg } from '../../../common/styles/Btn.jsx';
import StyledInput from '../../../common/styles/Input.jsx';
import SigninWithGoogleBtn from './SigninWithGoogleBtn.jsx';

const PanelWrapper = styled.div`
	border: 1px solid;
	padding: 20px 50px 20px 50px;
	margin-bottom: 20px;
	background-color: rgba(174, 224, 148, 0.95);
	margin-left: auto;
	margin-right: auto;
	width: 90%;
	max-width: 400px;
	opacity: 0.5;
	& > div {
		font-size: 18px;
	}
`;

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

export default class SigninPanel extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			loading: false
		};

	}
	signInWithEmailPassword() {
		console.log('Sign in with Email and password called!');
	}
	forgotPassword() {
		console.log('Forgot your password?');
	}
	registerEmailPassword() {
		console.log('Register with email and password.');
	}

	render() {
		if (this.state.loading) return <ReactLoading />;
		return (
            <PanelWrapper className="container-fluid">
				<h3>
					<FormattedMessage
						id="index.signinpanel.title"
						defaultMessage="Sign in now!"
					/>
				</h3>
				<div id="email-pwd-signin">
					<div className="row">
						<div className="col-xs-12">
							<FormulaHeading>
								<FormattedMessage
									id="index.signinpanel.email"
									defaultMessage="Email:"
								/>	
							</FormulaHeading>
						</div>
						<div className="col-xs-12">
							<StyledInput/>
						</div>
					</div>
					<div className="row">
						<div className="col-xs-12">
							<FormulaHeading>
								<FormattedMessage
									id="index.signinpanel.pwd"
									defaultMessage="Password:"
								/>	
							</FormulaHeading>
						</div>
						<div className="col-xs-12">
							<StyledInput type="password"/>
						</div>
					</div>
					<div className="row">
						<div className="col-xs-6">
							<FormulaLink onClick={() => this.forgotPassword()}><u>
								<FormattedMessage
									id="index.signinpanel.forgotpw"
									defaultMessage="Forgot PW?"
								/>	
							</u></FormulaLink>
						</div>
						<div className="col-xs-6">
							<FormulaLink onClick={() => this.registerEmailPassword()}><u>
								<FormattedMessage
									id="index.signinpanel.register-email-pwd"
									defaultMessage="Register now!"
								/>	
							</u></FormulaLink>
						</div>
					</div>
					<Spacer/>
					<div className="row">
						<BtnLg onClick={() => this.signInWithEmailPassword()}>
							<a>
								<i className="fa fa-sign-in fa-2x" />
							</a>
							<span>
								<FormattedMessage
									id="index.signinpanel.signin-email-pwd"
									defaultMessage="Sign in"
								/>
							</span>
						</BtnLg>
					</div>
				</div>

				<PanelDivisor/>

				<div id="social-signin">
					<h4>
						<FormattedMessage
							id="index.signinpanel.signin-social-heading"
							defaultMessage="Sign in / Register with existing Accounts"
						/>
					</h4>
					<SigninWithGoogleBtn auth={this.props.auth} history={this.props.history}/>
				</div>
            </PanelWrapper>
		);
	}
}
