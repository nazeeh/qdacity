import React from 'react';

import AdminEndpoint from '../../common/endpoints/AdminEndpoint';
import ChangeLogEndpoint from "../../common/endpoints/ChangeLogEndpoint";
import UserRegistrationsChart from "./UserRegistrationsChart.jsx";

export default class AdminStats extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			registeredUsers: "",
			activeUsers: "",
			projects: "",
			userCreatedChanges: []
		};
		this.init();
		//this.selectUser = this.selectUser.bind(this);
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
		ChangeLogEndpoint.getChanges("USER", "CREATED", null, null).then((result) => {
			this.setState({
				userCreatedChanges: result.items
			})
		});
	}


	render() {
		var _this = this;
		return (
			<div>
				<div className="row">
					<div className="col-lg-4 col-xs-6 small-gutter-right">
						<div className="info-box">
							<div className="info-box-icon bg-aqua">
								<i className="fa fa-users" aria-hidden="true"></i>
							</div>
							<div className="info-box-content">
								<span className="info-box-text">Registered Users</span>
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
								<span className="info-box-text">Active Users (30 Days)</span>
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
								<span className="info-box-text">Projects</span>
								<span id="topStatsCodings" className="info-box-number">{this.state.projects}</span>
							</div>
						</div>

					</div>
				</div>
				<div>
					User registered changes: {this.state.userCreatedChanges.length}
					<UserRegistrationsChart chartScriptPromise={this.props.chartScriptPromise}/>
				</div>
			</div>
		);
	}


}