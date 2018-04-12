import React from 'react';
import { FormattedMessage } from 'react-intl';

import styled from 'styled-components';
import Account from './Account.jsx';

const StyledAccountTab = styled.li`
	display: ${props => (props.loggedIn ? 'block' : 'none')} !important;
`;

const StyledHelpTab = styled.li`
	display: block;
`;

const StyledOfflineTab = styled.span`
	display: ${props => (props.connected ? 'none' : 'block')} !important;
`;


const StyledSigninTab = styled.li`
	display: ${props => (props.loggedIn ? 'none' : 'block')} !important;
`;

const StyledNavbarItem = styled.a`
	color: ${props => props.theme.defaultText} !important;
`;

const StyledDropdownLinks = styled.div`
	display: ${props =>
		!props.showOnlyIfLoggedIn || (props.showOnlyIfLoggedIn && props.loggedIn)
			? 'block'
			: 'none'};
	background: #efe8e8;
	margin: 5px;
	&:hover {
		background: #dcdada !important;
	}
`;

export default class NavBar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			userData: {},
		};

		this.authenticationProvider = props.auth.authentication;

		this.redirectToPersonalDashbaord = this.redirectToPersonalDashbaord.bind(
			this
		);
	}

	// lifecycle hook: update state for rerender
	componentWillReceiveProps(nextProps) {
		const _this = this;
		this.authenticationProvider.getCurrentUser().then(
			user => {
				_this.setState({
					userData: user
				});
			},
			() => {
				console.log('Could not get current user');
			}
		);
	}

	redirectToPersonalDashbaord() {
		this.props.history.push('/PersonalDashboard');
	}

	showAccountDropdown() {
		document.getElementById('accountView').classList.toggle('show');
	}

	showSigninDropdown() {
		document.getElementById('signinView').classList.toggle('show');
	}

	showHelpDropdown() {
		document.getElementById('helpView').classList.toggle('show');
	}

	render() {
		return (
			<nav
				className={'navbar navbar-default navbar-fixed-top topnav '
					+ (this.props.connected ? '' : 'navbar-offline')}
				role="navigation"
			>
				<div className="container topnav">
					<div className="navbar-header">
						<button
							type="button"
							className="navbar-toggle"
							data-toggle="collapse"
							data-target="#bs-example-navbar-collapse-1"
						>
							<span className="sr-only">
								<FormattedMessage
									id="navbar.toggle_navigation"
									defaultMessage="Toggle navigation"
								/>
							</span>{' '}
							<span className="icon-bar" /> <span className="icon-bar" />{' '}
							<span className="icon-bar" />
						</button>
						<StyledNavbarItem
							className="navbar-brand topnav clickable"
							onClick={this.redirectToPersonalDashbaord}
						>
							QDAcity
						</StyledNavbarItem>
						<StyledOfflineTab
							className="clickable navbar-text"
							connected={this.props.connected}
							onClick={() => {
								this.props.history.push('/Faq#offline-mode');
							}}
						>
							<subscript>
								<small><em>offline</em></small>
							</subscript>
						</StyledOfflineTab>
					</div>
					<div
						className="collapse navbar-collapse"
						id="bs-example-navbar-collapse-1"
					>
						<ul className="nav navbar-nav navbar-right">
							<StyledHelpTab
								loggedIn={this.props.auth.authState.isUserSignedIn}
								className="dropdown"
							>
								<StyledNavbarItem
									className="dropdownToggle clickable"
									onClick={function() {
										this.showHelpDropdown();
									}.bind(this)}
								>
									Help
								</StyledNavbarItem>
								<div id="helpView" className="dropdown-menu dropdownContent">
									<StyledDropdownLinks
										loggedIn={this.props.auth.authState.isUserSignedIn}
										className="clickable"
										onClick={() => {
											this.props.history.push('/Faq');
										}}
									>
										<div>Faq</div>
									</StyledDropdownLinks>
									<StyledDropdownLinks
										showOnlyIfLoggedIn
										loggedIn={this.props.auth.authState.isUserSignedIn}
										className="clickable"
										onClick={function() {
											this.props.tutorial.tutorialEngine.showOverviewWindow();
										}.bind(this)}
									>
										<div>Tutorial Overview</div>
									</StyledDropdownLinks>
								</div>
							</StyledHelpTab>
							<StyledAccountTab
								loggedIn={
									this.props.auth.authState.isUserSignedIn
								}
								className="dropdown"
							>
								<StyledNavbarItem
									className="dropdownToggle clickable"
									onClick={this.showAccountDropdown}
								>
									<FormattedMessage
										id="navbar.account"
										defaultMessage="Account"
									/>{' '}
									<b className="caret" />
								</StyledNavbarItem>
								<div id="accountView" className="dropdown-menu dropdownContent">
									<Account
										auth={this.props.auth}
										history={this.props.history}
									/>
								</div>
							</StyledAccountTab>
							{this.state.userData.type === 'ADMIN' && (
								<li>
									<StyledNavbarItem
										className="topnav clickable"
										onClick={() => this.props.history.push('/Admin')}
									>
										Administration
									</StyledNavbarItem>
								</li>
							)}
						</ul>
					</div>
				</div>
			</nav>
		);
	}
}
