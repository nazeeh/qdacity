import React from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';

import { BtnDefault, BtnPrimary } from './styles/Btn.jsx';

const UserImage = styled.img`
	width: 96px;
`;

export default class Account extends React.Component {
	constructor(props) {
		super(props);

		this.authenticationProvider = props.auth.authentication;

		this.state = {
			name: '',
			email: '',
			picSrc: ''
		};

		this.redirectToPersonalDashbaord = this.redirectToPersonalDashbaord.bind(
			this
		);

		this.updateFromProps(props);
	}

	// lifecycle hook: update state for rerender
	componentWillReceiveProps(nextProps) {
		this.updateFromProps(nextProps);
	}

	updateFromProps(targetedProps) {
		this.authenticationProvider = targetedProps.auth.authentication;
		const _this = this;
		this.authenticationProvider.getProfile().then(function(profile) {
			/*
			* Removing query parameters from URL.
			* With google we always got ?sz=50 in the URL which gives you a
			* small low res thumbnail. Without parameter we get the original
			* image.
			* When adding other LoginProviders this needs to be reviewed
			*/
			var url = URI(profile.thumbnail).fragment(true);
			const picSrcWithoutParams = url.protocol() + '://' + url.hostname() + url.path();
			_this.setState({
				name: profile.name,
				email: profile.email,
				picSrc: picSrcWithoutParams
			});
		});
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

	onChanceUser() {
		const _this = this;
		this.authenticationProvider.changeAccount().then(
			() => {
				location.reload();
				// no redirect neccessary because App.jsx rerenders if auth state changes
			},
			error => {
				console.log(error);
				_this.props.history.push('/');
			}
		);
	}

	render() {
		return (
			<div>
				<div className="navbar-content">
					<div className="row">
						<div className="col-xs-5">
							<UserImage
								id="currentUserPicture"
								src={this.state.picSrc}
								alt=""
								className="img-responsive"
							/>
							<p className="text-center small" />
						</div>
						<div className="col-xs-7">
							<span id="currentUserName">{this.state.name}</span>
							<p id="currentUserEmail" className="text-muted small">
								{this.state.email}
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
