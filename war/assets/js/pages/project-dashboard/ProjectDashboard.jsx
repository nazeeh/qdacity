import React from 'react';

import Project from './Project';

import ProjectEndpoint from 'endpoints/ProjectEndpoint';

import TitleRow from "./TitleRow/TitleRow.jsx"
import ProjectStats from "./ProjectStats.jsx"
import Description from "./Description.jsx";
import AgreementStats from './AgreementStats.jsx';
import Users from "./Users/Users.jsx"
import RevisionHistory from "./RevisionHistory/RevisionHistory.jsx"
import ParentProject from "./ParentProject/ParentProject.jsx"
import PersonalReportList from "./PersonalReportList.jsx"

import 'script!../../../../components/URIjs/URI.min.js';
import 'script!../../../../components/alertify/alertify-0.3.js';

export default class ProjectDashboard extends React.Component {
	constructor(props) {
		super(props);
		var urlParams = URI(window.location.search).query(true);
		var projectType = (urlParams.type ? urlParams.type : 'PROJECT');

		var project = new Project(urlParams.project, projectType);

		this.state = {
			project: project,
			reports: [],
			isProjectOwner: false,
			isValidationCoder: false
		};

		this.init();

		this.addReports = this.addReports.bind(this);

	}

	init() {
		this.userPromise = this.props.account.getCurrentUser();
		this.setUserRights();
		this.setProjectProperties();
	}

	setUserRights() {
		var _this = this;
		this.userPromise.then(function (user) {
			var isProjectOwner = _this.props.account.isProjectOwner(user, _this.state.project.getId());
			_this.setState({
				isProjectOwner: isProjectOwner
			});
		});
	}

	setProjectProperties() {
		var _this = this;
		var project = this.state.project;
		ProjectEndpoint.getProject(project.getId(), project.getType()).then(function (resp) {
			_this.userPromise.then(function (user) {
				var isValidationCoder = _this.props.account.isValidationCoder(user, resp);
				_this.setState({
					isValidationCoder: isValidationCoder
				});
			});

			project.setName(resp.name);
			project.setDescription(resp.description);
			project.setRevisionID(resp.revisionID);
			project.setUmlEditorEnabled(resp.umlEditorEnabled);
			project.setParentID(resp.projectID); // Only present for ValidationProject
			project.setRevisionID(resp.revisionID); // Only present for ValidationProject
			_this.setState({
				project: project
			});
		});
	}

	addReports(newReports) {
		var reports = this.state.reports.concat(newReports);
		this.setState({
			reports: reports
		});
	}

	render() {
		return (
			<div>
				<TitleRow account={this.props.account} project={this.state.project} isProjectOwner={this.state.isProjectOwner} isValidationCoder={this.state.isValidationCoder} />
				<div className="row">
					<div className="col-lg-7">
						<Description project={this.state.project} isProjectOwner={this.state.isProjectOwner} />
						<ProjectStats  project={this.state.project} />
						<div className="box box-default">
							<div className="box-header with-border">
							<h3 className="box-title">Intercoder Agreement</h3>
								<AgreementStats  reports={this.state.reports}/>
							</div>
							<div className="box-body">
							<div className="row" >
							<div className="col-xs-12">
							<div id="agreementStats1" className="agreementStats"></div>
							</div>

						</div>
							</div>
						</div>
						<div id="changeLog"></div>
					</div>
					<div className="col-lg-5">
						<Users project={this.state.project}  isProjectOwner={this.state.isProjectOwner}/>
						<RevisionHistory project={this.state.project}  addReports={this.addReports} userPromise={this.userPromise} />

						<ParentProject project={this.state.project} />
						{(this.state.project.getParentID() ? (<PersonalReportList project={this.state.project} account={this.props.account} />) : "" )}
					</div>
				</div>
		  	</div>
		);
	}
}