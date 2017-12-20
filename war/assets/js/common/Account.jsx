import React from 'react';
import { FormattedMessage } from 'react-intl';

import {
	BtnDefault,
	BtnPrimary
} from './styles/Btn.jsx';

export default class Account extends React.Component {

	constructor(props) {
		super(props);

		this.authenticationProvider = props.auth.authentication;

		this.state = {
			name: '',
			email: '',
			picSrc: ''
		};
	}
	
	// lifecycle hook: update before rerender
	componentWillUpdate() {
		const _this = this;
		this.authenticationProvider.getProfile().then(function(profile) {
				const data = {
					name:	profile.name,
					email: profile.email,
					picSrc: profile.thumbnail
				};
				_this.updateState(data);
		});
	}

	/**
	 * Updates the state if neccessary (changes happend to state)
	 * Otherwise endless recursion is triggered... 
	 * componentWillUpdate renders first and triggers a rerender as soon as the profile data arrived!
	 */
	updateState(nextState) {
		if(this.state.email !== nextState.email && 
			this.state.name !== nextState.name && 
			this.state.picSrc !== nextState.picSrc) {
				this.setState(nextState);
		}
	}

  /**
	 * Redirects to the personal dashboard
   */
  redirectToPersonalDashbaord() {
    this.props.history.push('/PersonalDashboard');
	}

	onSignOut() {
		const _this = this;
		this.authenticationProvider.signOut().then(() => { 
			_this.props.history.push('/'); 
			location.reload(); 
		});
	}

	render() {
		console.log(this.state);
		return (
			<div>
				<div className="navbar-content">
					<div className="row">
						<div className="col-xs-3">
							<img id="currentUserPicture" src={this.state.picSrc} alt="" className="img-responsive" />
							<p className="text-center small">
							</p>
						</div>
						<div className="col-xs-9">
							<span id="currentUserName">{this.state.name}</span>
							<p id="currentUserEmail" className="text-muted small">{this.state.email}</p>
							<div className="divider"></div>
							<BtnPrimary onClick={this.redirectToPersonalDashbaord}><FormattedMessage id='account.personal_dashboard' defaultMessage='Personal Dashboard' /></BtnPrimary>
						</div>
					</div>
				</div>
				<div className="navbar-footer">
					<div className="navbar-footer-content">
						<div className="row">
							<div className="col-xs-6">
								<BtnDefault id="navBtnSwitchAccount"  href="#" className="btn btn-default btn-sm" onClick={() => this.authenticationProvider.changeAccount().then(() => location.reload())}><FormattedMessage id='account.switch_user' defaultMessage='Switch User' /></BtnDefault>
							</div>
							<div className="col-xs-6">
								<BtnDefault id="navBtnSignOut" className="btn btn-default btn-sm pull-right" onClick={() => this.onSignOut()}><FormattedMessage id='account.sign_out' defaultMessage='Sign Out' /></BtnDefault>
							</div>
						</div>
					</div>
				</div>
			</div>

		);
	}
}
