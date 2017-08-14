import React from 'react'
import styled from 'styled-components';

import Account from './Account.jsx';

const StyledAccountTab = styled.li `
	display: ${props => props.loggedIn ? 'block' : 'none'} !important;
`;

const StyledSigninTab = styled.li `
	display: ${props => props.loggedIn ? 'none' : 'block'} !important;
`;

const StyledNavbarItem = styled.a `
	color: #323232 !important;
`;

export default class NavBar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};

		this.account = {};

		this.redirectToPersonalDashbaord = this.redirectToPersonalDashbaord.bind(this);
	}

	redirectToPersonalDashbaord() {
		this.props.history.push('/PersonalDashboard');
	}


	render() {
		return (
			<nav className="navbar navbar-default navbar-fixed-top topnav" role="navigation">
					<div className="container topnav">
						<div className="navbar-header">
							<button type="button" className="navbar-toggle" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
								<span className="sr-only">Toggle navigation</span> <span className="icon-bar"></span> <span className="icon-bar"></span> <span className="icon-bar"></span>
							</button>
							<StyledNavbarItem className="navbar-brand topnav clickable" onClick={this.redirectToPersonalDashbaord}>QDAcity</StyledNavbarItem>
						</div>
						<div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
							<ul className="nav navbar-nav navbar-right">
								<li><StyledNavbarItem href="/#about">About</StyledNavbarItem></li>
								<li><StyledNavbarItem href="/#contact">Contact</StyledNavbarItem></li>
								<StyledAccountTab loggedIn={this.account.isSignedIn && this.account.isSignedIn()}  className="dropdown">
									<StyledNavbarItem href="#" className="dropdown-toggle" data-toggle="dropdown">
										Account <b className="caret"></b>
									</StyledNavbarItem>
			 						<div id="accountView" className="dropdown-menu">
										<Account ref={(c) => this.account = c} client_id={this.props.client_id} scopes={this.props.scopes} callback={this.props.callback}  history={this.props.history}/>
									</div>
								</StyledAccountTab>
								<StyledSigninTab  loggedIn={this.account.isSignedIn && this.account.isSignedIn()} className="dropdown">
									<StyledNavbarItem href="#" className="dropdown-toggle" data-toggle="dropdown">
											Sign In <b className="caret"></b>
										</StyledNavbarItem>
										<ul className="dropdown-menu">
											<li>
												<div className="navbar-content">
													<div className="row">
														<div className="col-md-12">
															<a id="navBtnSigninGoogle" className="btn  btn-primary" href="#">
																<i className="fa fa-google fa-2x pull-left"></i>
																<span >Sign in with Google</span>
															</a>
														</div>
													</div>
												</div>
												<div className="navbar-footer">
													<div className="navbar-footer-content">
														<div className="row">
															<div className="col-md-12"></div>
														</div>
													</div>
												</div>
											</li>
										</ul>
								</StyledSigninTab>
							</ul>
						</div>
					</div>
				</nav>
		);
	}
}