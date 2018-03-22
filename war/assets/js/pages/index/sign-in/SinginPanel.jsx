//@ts-check
import React from 'react';
import styled from 'styled-components';

import { FormattedMessage } from 'react-intl';
import IntlProvider from '../../../common/Localization/LocalizationProvider';

import SignInFormula from './SigninFormula.jsx';

import { BtnLg, BtnDefault, BtnPrimary } from '../../../common/styles/Btn.jsx';

const PanelWrapper = styled.div`
	border: 1px solid ${props => props.theme.borderPrimaryHighlight};
	padding: 20px 50px 20px 50px;
	margin-bottom: 20px;
	padding-bottom: 20px;
	background-color: ${props => props.theme.defaultPaneBg};
	color: ${props => props.theme.defaultText};
	margin-left: auto;
	margin-right: auto;
	width: 90%;
	max-width: 400px;
	opacity: 0.8;
	& > div {
		font-size: 18px;
	}
`;

const UserThumbnail = styled.img`
	height: 80px;
	width: 80px;

	margin-top: 20px;
	margin-bottom: 7px;
`;

const ButtonGroupWrapper = styled.div`
	& > button {
		margin: 3px 10px;
	}
`;

export default class SigninPanel extends React.Component {
	constructor(props) {
		super(props);

		this.onSignedIn = this.onSignedIn.bind(this);
	}

	async onSignOut() {
		await this.props.auth.authentication.signOut();
		this.props.history.push('/');
	}

	onSignedIn() {
		this.props.history.push('/PersonalDashboard');
	}

	render() {
		if (
			this.props.auth.authState.isUserSignedIn &&
			this.props.auth.authState.isUserRegistered
		) {
			return (
				<PanelWrapper className="container-fluid">
					<h3><FormattedMessage
                        id="signin-panel.title"
                        defaultMessage="You are currently signed in!"
                    /></h3>	
					<div className="row">
						<UserThumbnail id="signinPanelUserThumbnail" src={this.props.auth.userProfile.picSrc} alt='user thumbnail'/>
					</div>
					
					<div className="row">
						<span id="signinPanelUserName">{this.props.auth.userProfile.name}</span>
					</div>

					<div className="row">
						<p id="signinPanelUserEmail" className="text-muted small">
							{this.props.auth.userProfile.email}
						</p>
					</div>

					<div className="row">
						<ButtonGroupWrapper>
							<BtnDefault onClick={() => this.onSignOut()}>
								<FormattedMessage
									id="signin-panel.signout"
									defaultMessage="Sign Out"
								/>
							</BtnDefault>
							<BtnPrimary onClick={() => this.props.history.push('/PersonalDashboard')}>
								<FormattedMessage
									id="signin-panel.link-personal-dashboard"
									defaultMessage="Personal Dashboard"
								/>
							</BtnPrimary>
						</ButtonGroupWrapper>
					</div>

				</PanelWrapper>
			);
		}
		else {
			return (
				<PanelWrapper className="container-fluid">
					<SignInFormula 
						theme={this.props.theme}
						auth={this.props.auth}
						onSignedIn={this.onSignedIn}/>
				</PanelWrapper>
			);
		}
	}
}
