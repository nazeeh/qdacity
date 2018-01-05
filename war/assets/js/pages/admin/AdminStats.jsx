import React from 'react';
import { FormattedMessage } from 'react-intl';

import AdminEndpoint from '../../common/endpoints/AdminEndpoint';
import UserRegistrationsChart from "./UserRegistrationsChart.jsx";
import ActiveUsersChart from "./ActiveUsersChart.jsx";

export default class AdminStats extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			registeredUsers: "",
			activeUsers: "",
			projects: ""
		};
		this.init();
	}

	init() {
		var _this = this;
		AdminEndpoint.getAdminStats().then(function (resp) {
			_this.setState({
				registeredUsers: resp.registeredUsers,
				activeUsers: resp.activeUsers,
				projects: resp.projects
			});
		});
	}


	render() {
		var _this = this;
		return (
			<div>
				<div className="box box-default">
					<div className="box-header with-border">
						<h3 className="box-title"><FormattedMessage id='adminstats.general_stats' defaultMessage='General Statistics' /></h3>
					</div>
					<div className="box-body">
					<div>
						<div className="row">
							<div className="col-lg-4 col-xs-6 small-gutter-right">
								<div className="info-box">
									<div className="info-box-icon bg-aqua">
										<i className="fa fa-users" aria-hidden="true"></i>
									</div>
									<div className="info-box-content">
										<span className="info-box-text"><FormattedMessage id='adminstats.registered_users' defaultMessage='Registered Users' /></span>
										<span id="topStatsDocuments" className="info-box-number">{this.state.registeredUsers}</span>
									</div>
								</div>
							</div>
							<div className="col-lg-4 col-xs-6 small-gutter">
								<div className="info-box">
									<div className="info-box-icon bg-yellow">
										<i className="fa fa-heartbeat" aria-hidden="true"></i>
									</div>
									<div className="info-box-content">
										<span className="info-box-text"><FormattedMessage id='adminstats.active_users' defaultMessage='Active Users' /> (<FormattedMessage id='adminstats.last_thirty_days' defaultMessage='30 days' />)</span>
										<span id="topStatsCodes" className="info-box-number">{this.state.activeUsers}</span>
									</div>
								</div>
							</div>
							<div className="col-lg-4 col-xs-6 small-gutter-left">
								<div className="info-box">
									<div className="info-box-icon bg-red">
										<i className="fa fa-folder" aria-hidden="true"></i>
									</div>
									<div className="info-box-content">
										<span className="info-box-text"><FormattedMessage id='adminstats.projects' defaultMessage='Projects' /></span>
										<span id="topStatsCodings" className="info-box-number">{this.state.projects}</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
				<div className="box box-default">
					<div className="box-header with-border">
						<h3 className="box-title"><FormattedMessage id='adminstats.user_regs_over_time' defaultMessage='User registrations over time' /></h3>
					</div>
					<div className="box-body">
						<UserRegistrationsChart chartScriptPromise={this.props.chartScriptPromise}/>
					</div>
				</div>
				<div className="box box-default">
					<div className="box-header with-border">
						<h3 className="box-title">Active users over time</h3>
					</div>
					<div className="box-body">
						<ActiveUsersChart chartScriptPromise={this.props.chartScriptPromise}/>
					</div>
				</div>
			</div>
		);
	}


}
