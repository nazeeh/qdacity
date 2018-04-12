import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';

import Project from './Project';

import ProjectEndpoint from 'endpoints/ProjectEndpoint';

import TitleRow from './TitleRow/TitleRow.jsx';
import ProjectStats from './ProjectStats.jsx';
import Description from './Description.jsx';
import AgreementStats from './AgreementStats.jsx';
import Users from './Users/Users.jsx';
import RevisionHistory from './RevisionHistory/RevisionHistory.jsx';
import ParentProject from './ParentProject/ParentProject.jsx';
import PersonalReportList from './PersonalReportList.jsx';

import UnauthenticatedUserPanel from '../../common/UnauthenticatedUserPanel.jsx';

import 'script-loader!../../../../components/URIjs/URI.min.js';
import 'script-loader!../../../../components/alertify/alertify-0.3.js';

const StyledDashboard = styled.div`
	margin-top: 35px;
`;

export default class ProjectDashboard extends React.Component {
	constructor(props) {
		super(props);
		var urlParams = URI(window.location.search).query(true);
		var projectType = urlParams.type ? urlParams.type : 'PROJECT';

		var project = new Project(urlParams.project, projectType);

		this.state = {
			project: project,
			reports: [],
			isProjectOwner: false,
			isValidationCoder: false,
			googleChartsLoaded: false
		};

		this.authenticationProvider = this.props.auth.authentication;

		this.props.chartScriptPromise.then(() => {
			this.setState({
				googleChartsLoaded: true
			});
		});
		this.addReports = this.addReports.bind(this);

		scroll(0, 0);
	}

	init() {
		if (!this.userPromise) {
			this.userPromise = this.authenticationProvider.getCurrentUser();
			this.setProjectProperties();
		}
	}

	setProjectProperties() {
		var _this = this;
		var project = this.state.project;
		ProjectEndpoint.getProject(project.getId(), project.getType()).then(
			function(resp) {
				_this.userPromise.then(function(user) {
					var isValidationCoder = _this.props.auth.authorization.isValidationCoder(
						user,
						resp
					);
					var isProjectOwner = _this.props.auth.authorization.isProjectOwner(
						user,
						resp
					);
					_this.setState({
						isValidationCoder: isValidationCoder,
						isProjectOwner: isProjectOwner
					});
				});

				project.setName(resp.name);
				project.setDescription(resp.description);
				project.setRevisionID(resp.revisionID);
				project.setUmlEditorEnabled(resp.umlEditorEnabled);
				project.setParentID(resp.projectID); // Only present for ValidationProject
				project.setRevisionID(resp.revisionID); // Only present for ValidationProject
				console.log(project.name);
				_this.setState({
					project: project
				});
			}
		);
	}

	addReports(newReports) {
		var reports = this.state.reports.concat(newReports);
		this.setState({
			reports: reports
		});
	}

	renderAgreementStats() {
		if (!this.state.googleChartsLoaded) return null;
		return (
			<AgreementStats
				reports={this.state.reports}
				chartScriptPromise={this.props.chartScriptPromise}
			/>
		);
	}

	render() {
		if (
			!this.props.auth.authState.isUserSignedIn
		) {
			return <UnauthenticatedUserPanel history={this.props.history} auth={this.props.auth} />;
		}
		this.init();

		return (
			<StyledDashboard className="container main-content">
				<TitleRow
					auth={this.props.auth}
					project={this.state.project}
					isProjectOwner={this.state.isProjectOwner}
					isValidationCoder={this.state.isValidationCoder}
					history={this.props.history}
				/>
				<div className="row">
					<div className="col-lg-7">
						<Description
							project={this.state.project}
							isProjectOwner={this.state.isProjectOwner}
						/>
						<ProjectStats project={this.state.project} />
						<div className="box box-default">
							<div className="box-header with-border">
								<h3 className="box-title">
									<FormattedMessage
										id="projectdashboard.intercoder_agreement"
										defaultMessage="Intercoder Agreement"
									/>
								</h3>
							</div>
							<div className="box-body">{this.renderAgreementStats()}</div>
						</div>
						<div id="changeLog" />
					</div>
					<div className="col-lg-5">
						<Users
							project={this.state.project}
							isProjectOwner={this.state.isProjectOwner}
						/>

						<RevisionHistory
							project={this.state.project}
							addReports={this.addReports}
							userPromise={this.userPromise}
							history={this.props.history}
							isProjectOwner={this.state.isProjectOwner}
						/>

						<ParentProject
							project={this.state.project}
							history={this.props.history}
						/>
						{this.state.project.getParentID() ? (
							<PersonalReportList
								auth={this.props.auth}
								project={this.state.project}
								history={this.props.history}
							/>
						) : (
							''
						)}
					</div>
				</div>
			</StyledDashboard>
		);
	}
}
