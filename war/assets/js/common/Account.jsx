import React from 'react';
import {
	FormattedMessage
} from 'react-intl';

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

		this.redirectToPersonalDashbaord = this.redirectToPersonalDashbaord.bind(this);

		this.updateFromProps(props);
	}

	// lifecycle hook: update state for rerender
	componentWillReceiveProps(nextProps) {
		this.updateFromProps(nextProps);
	}

	updateFromProps(targetedProps) {
		this.authenticationProvider = targetedProps.auth.authentication;
		const _this = this;
		this.authenticationProvider.getProfile().then(function (profile) {
			_this.state.name = profile.name;
			_this.state.email = profile.email;
			_this.state.picSrc = profile.thumbnail;
			_this.setState(_this.state);
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
		this.authenticationProvider.signOut().then(() => {
			_this.props.history.push('/');
		}, (error) => {
			console.log(error);
			_this.props.history.push('/');
		});
	}

	onChanceUser() {
		const _this = this;
		this.authenticationProvider.changeAccount().then(() => {
			location.reload();
		}, (error) => {
			console.log(error);
			_this.props.history.push('/');
		});
	}

	render() {
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
								<BtnDefault id="navBtnSwitchAccount"  href="#" className="btn btn-default btn-sm" onClick={() => this.onChanceUser()}><FormattedMessage id='account.switch_user' defaultMessage='Switch User' /></BtnDefault>
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