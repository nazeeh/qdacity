import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';

import { BtnDefault, BtnPrimary } from './styles/Btn.jsx';

import SigninFormula from '../pages/index/sign-in/SigninFormula.jsx';

import VexModal from './modals/VexModal.js'

// React-Intl
import IntlProvider from './Localization/LocalizationProvider';

const UserImage = styled.img`
	width: 96px;
`;

const ChangeAccountWrapper = styled.div`
	padding: 20px 50px 20px 50px;
	margin-bottom: 20px;
	padding-bottom: 20px;
	margin-left: auto;
	margin-right: auto;
	max-width: 400px;
	opacity: 0.8;
	& > div {
		font-size: 18px;
	}`;

export default class Account extends React.Component {
	constructor(props) {
		super(props);

		this.authenticationProvider = props.auth.authentication;

		this.redirectToPersonalDashbaord = this.redirectToPersonalDashbaord.bind(
			this
		);
		
		this.onSignedIn = this.onSignedIn.bind(this);
	}

	/**
	 * Redirects to the personal dashboard
	 */
	redirectToPersonalDashbaord() {
		this.props.history.push('/PersonalDashboard');
	}

	onSignOut() {
		const _this = this;
		this.authenticationProvider.signOut().then(
			() => {
				_this.props.history.push('/');
			},
			error => {
				console.log(error);
				_this.props.history.push('/');
			}
		);
	}

	onSignedIn() {
		location.reload();
	}

	onChanceUser() {
		const _this = this;
		var promise = new Promise(function(resolve, reject) {
			const { formatMessage } = IntlProvider.intl;

			const formElements = '<div id="change-account-placeholder">';

			vex.dialog.open({
				message: formatMessage({
					id: 'change-account.heading',
					defaultMessage: 'Change Account'
				}),
				className: 'vex-theme-wireframe',
				contentCSS: {
					width: '600px',
					'margin-top': '-100px'
				},
				input: formElements,
				buttons: [
					$.extend({}, vex.dialog.buttons.NO, {
						text: formatMessage({
							id: 'modal.cancel',
							defaultMessage: 'Cancel'
						})
					})
				],
				callback: function(data) {
					resolve(data);
				}
			});
			ReactDOM.render(
				<IntlProvider>
					<ChangeAccountWrapper className="container-fluid">
						<SigninFormula auth={_this.props.auth} onSignedIn={_this.onSignedIn}/>
					</ChangeAccountWrapper>
				</IntlProvider>,
				document.getElementById('change-account-placeholder')
			);
		});
	}

	render() {
		return (
			<div>
				<div className="navbar-content">
					<div className="row">
						<div className="col-xs-5">
							<UserImage
								id="currentUserPicture"
								src={this.props.auth.userProfile.picSrc}
								alt=""
								className="img-responsive"
							/>
							<p className="text-center small" />
						</div>
						<div className="col-xs-7">
							<span id="currentUserName">{this.props.auth.userProfile.name}</span>
							<p id="currentUserEmail" className="text-muted small">
								{this.props.auth.userProfile.email}
							</p>
							<div className="divider" />
							<BtnPrimary onClick={this.redirectToPersonalDashbaord}>
								<FormattedMessage
									id="account.personal_dashboard"
									defaultMessage="Personal Dashboard"
								/>
							</BtnPrimary>
						</div>
					</div>
				</div>
				<div className="navbar-footer">
					<div className="navbar-footer-content">
						<div className="row">
							<div className="col-xs-6">
								<BtnDefault
									id="navBtnSwitchAccount"
									href="#"
									className="btn btn-default btn-sm"
									onClick={() => this.onChanceUser()}
								>
									<FormattedMessage
										id="account.switch_user"
										defaultMessage="Switch User"
									/>
								</BtnDefault>
							</div>
							<div className="col-xs-6">
								<BtnDefault
									id="navBtnSignOut"
									className="btn btn-default btn-sm pull-right"
									onClick={() => this.onSignOut()}
								>
									<FormattedMessage
										id="account.sign_out"
										defaultMessage="Sign Out"
									/>
								</BtnDefault>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
