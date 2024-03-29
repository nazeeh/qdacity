import React from 'react';
import { FormattedMessage } from 'react-intl';
import IntlProvider from '../../../common/Localization/LocalizationProvider';
import styled from 'styled-components';

import ReportList from './ReportList.jsx';
import ValPrjList from './ValPrjList.jsx';
import CreateRevisionBtn from './CreateRevisionBtn.jsx';
import ReCodeBtn from './ReCodeBtn.jsx';

import ValidationEndpoint from '../../../common/endpoints/ValidationEndpoint';
import ProjectEndpoint from '../../../common/endpoints/ProjectEndpoint';
import DocumentsEndpoint from '../../../common/endpoints/DocumentsEndpoint';

import CustomForm from '../../../common/modals/CustomForm';

import { BtnDefault } from '../../../common/styles/Btn.jsx';

const SyledCreateReportBtn = BtnDefault.extend`
	margin-top: -6px;
`;

const StyledBtnIcon = styled.i`
	font-size: 18px;
`;

export default class RevisionHistory extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			revisions: [],
			validationProjects: [],
			reports: [],
			isAdmin: false
		};

		this.renderReports = this.renderReports.bind(this);
		this.addRevision = this.addRevision.bind(this);
		this.createNewRevision = this.createNewRevision.bind(this);

		this.init();
	}

	init() {
		var _this = this;
		var project = this.props.project;
		var validationEndpoint = new ValidationEndpoint();

		var validationPromise = validationEndpoint.listReports(project.getId());

		ProjectEndpoint.listRevisions(project.getId()).then(function(resp) {
			_this.props.userPromise.then(function(user) {
				resp.items = resp.items || [];
				var snapshots = [];
				var validationProjects = {};
				for (var i = 0; i < resp.items.length; i++) {
					if (resp.items[i].revisionID === undefined)
						snapshots.push(resp.items[i]);
					else {
						if (validationProjects[resp.items[i].revisionID] === undefined)
							validationProjects[resp.items[i].revisionID] = [];
						validationProjects[resp.items[i].revisionID].push(resp.items[i]);
					}
				}
				project.setRevisions(snapshots);
				project.setValidationProjects(validationProjects);

				validationPromise.then(function(reports) {
					for (var i = 0; i < snapshots.length; i++) {
						var revID = snapshots[i].id;
						if (typeof reports[revID] != 'undefined') {
							_this.props.addReports(reports[revID]);
						}
					}

					project.setReports(reports);

					_this.setRevisions(snapshots);
					_this.setValidationProjects(validationProjects);
					_this.setReports(reports);
					_this.setRights(user);
				});
			});
		});
	}

	setRights(user) {
		const isAdmin = user.type === 'ADMIN';

		this.setState({
			isAdmin: isAdmin
		});
	}

	setRevisions(pRevisions) {
		this.setState({
			revisions: pRevisions
		});
	}

	setValidationProjects(pValidationProjects) {
		this.setState({
			validationProjects: pValidationProjects
		});
	}

	setReports(pReports) {
		this.setState({
			reports: pReports
		});
	}

	addRevision(pRevision) {
		this.state.revisions.unshift(pRevision);
		this.setState({
			revisions: this.state.revisions
		});
	}

	createNewRevision(prjId, comment) {
		const { formatMessage } = IntlProvider.intl;
		var _this = this;
		ProjectEndpoint.createSnapshot(prjId, comment)
			.then(function(resp) {
				alertify.success(
					formatMessage({
						id: 'revisionhistory.revision_created',
						defaultMessage: 'New revision has been created'
					})
				);
				_this.addRevision(resp);
			})
			.catch(function(resp) {
				alertify.error(
					formatMessage({
						id: 'revisionhistory.revision_creation_failed',
						defaultMessage: 'New revision has not been created'
					})
				);
			});
	}

	deleteRevision(revisionId, index) {
		const { formatMessage } = IntlProvider.intl;
		var _this = this;
		var projectEndpoint = new ProjectEndpoint();

		projectEndpoint
			.deleteRevision(revisionId)
			.then(function(val) {
				alertify.success(
					formatMessage({
						id: 'revisionhistory.revision_deleted',
						defaultMessage: 'Revision has been deleted'
					})
				);
				_this.state.revisions.splice(index, 1);
				_this.setState({
					revisions: _this.state.revisions
				});
			})
			.catch(_this.handleBadResponse);
	}

	createReport(revId) {
		const { formatMessage } = IntlProvider.intl;
		var projectEndpoint = new ProjectEndpoint();
		DocumentsEndpoint.getDocuments(revId, 'REVISION').then(function(documents) {
			var modal = new CustomForm(
				formatMessage({
					id: 'revisionhistory.create_validation_report',
					defaultMessage: 'Create Validation Report'
				})
			);
			modal.addTextInput(
				'title',
				formatMessage({
					id: 'revisionhistory.report_title',
					defaultMessage: 'Report Title'
				}),
				'',
				''
			);
			var documentTitles = [];

			modal.addCheckBoxes('docs', documents);

			//TODO should not be hardcoded here
			var methods = ['f-measure', 'krippendorffs-alpha', 'fleiss-kappa'];
			var units = ['paragraph', 'sentence'];

			modal.addSelect(
				'method',
				methods,
				formatMessage({
					id: 'revisionhistory.evaluation_method',
					defaultMessage: 'Evaluation Method'
				})
			);
			modal.addSelect(
				'unit',
				units,
				formatMessage({
					id: 'revisionhistory.unit_of_coding',
					defaultMessage: 'Unit of Coding'
				})
			);

			modal.showModal().then(function(data) {
				var selectedDocs = [];
				console.log(revId, data.title, data.docs, data.method, data.unit);
				projectEndpoint
					.evaluateRevision(
						revId,
						data.title,
						data.docs,
						data.method,
						data.unit
					) //TODO
					.then(function(val) {
						alertify.success(
							formatMessage({
								id: 'revisionhistory.report_initiated',
								defaultMessage: 'Report Initiated. This may take a few minutes'
							})
						);
					})
					.catch(this.handleBadResponse);
			});
		});
	}

	handleBadResponse(reason) {
		const { formatMessage } = IntlProvider.intl;
		alertify.error(
			formatMessage({
				id: 'revisionhistory.error',
				defaultMessage: 'There was an error'
			})
		);
		console.log(reason.message);
	}

	renderRevisionDeleteBtn(revision, index) {
		if (this.state.isAdmin || this.props.isProjectOwner)
			return (
				<a
					onClick={() => this.deleteRevision(revision.id, index)}
					className="btn btn-danger btn-xs pull-right"
				>
					<FormattedMessage
						id="revisionhistory.delete"
						defaultMessage="Delete"
					/>
				</a>
			);
		else return '';
	}

	renderReports(revId) {
		if (!this.state.reports[revId]) return '';
		var reports = this.state.reports[revId];

		return [
			<i key={'label_' + revId} className="fa fa-tachometer bg-grey" />,
			<div key={revId} className="timeline-item">
				<h3 className="timeline-header timelineUserName">
					<b>
						{' '}
						<FormattedMessage
							id="revisionhistory.reports"
							defaultMessage="Reports"
						/>{' '}
					</b>
				</h3>
				<div className="timeline-body timelineContent">
					<ReportList
						reports={reports}
						isAdmin={this.state.isAdmin}
						isProjectOwner={this.props.isProjectOwner}
						history={this.props.history}
					/>
				</div>
			</div>
		];
	}

	renderCreateReportBtn(revId) {
		if (this.state.isAdmin || this.props.isProjectOwner)
			return (
				<SyledCreateReportBtn
					onClick={() => this.createReport(revId)}
					className=" pull-right"
				>
					<StyledBtnIcon className="fa fa-plus-circle" />
					<FormattedMessage
						id="revisionhistory.create_report"
						defaultMessage="Create Report"
					/>
				</SyledCreateReportBtn>
			);
		else return '';
	}

	renderValidationProjects(revId) {
		if (!this.state.validationProjects[revId]) return '';
		var validationProjects = this.state.validationProjects[revId];

		return [
			<i key={'label_' + revId} className="fa fa-check bg-grey" />,
			<div key={revId} className="timeline-item">
				<h3 className="timeline-header timelineUserName">
					<b>
						{' '}
						<FormattedMessage
							id="revisionhistory.validation_projects"
							defaultMessage="Validation Projects"
						/>{' '}
					</b>
					{this.renderCreateReportBtn(revId)}
				</h3>
				<div className="timeline-body timelineContent">
					<ValPrjList
						validationProjects={validationProjects}
						isAdmin={this.state.isAdmin}
						isProjectOwner={this.props.isProjectOwner}
						history={this.props.history}
					/>
				</div>
			</div>
		];
	}

	render() {
		const { formatMessage } = IntlProvider.intl;
		var _this = this;

		if (this.props.project.type != 'PROJECT') return null;

		//Render Revision
		const renderRevisions = this.state.revisions.map((revision, index) => {
			return [
				<li key={'label_' + revision.id} className="time-label">
					<span className="bg-red timelineTime">
						{formatMessage(
							{
								id: 'revisionhistory.revision_number',
								defaultMessage: 'Revision {number}'
							},
							{ number: revision.revision }
						)}
					</span>
				</li>,
				<li key={revision.id}>
					<i className="fa fa-info bg-yellow" />
					<div className="timeline-item">
						<h3 className="timeline-header timelineUserName">
							<b>
								{' '}
								<FormattedMessage
									id="revisionhistory.revision_info"
									defaultMessage="Revision Info"
								/>{' '}
							</b>{' '}
						</h3>
						<div className="timeline-body timelineContent">
							{revision.comment}
						</div>
						<div className="timeline-footer">
							<ReCodeBtn revId={revision.id} />
							{_this.renderRevisionDeleteBtn(revision, index)}
						</div>
					</div>
				</li>,
				<li>{_this.renderReports(revision.id)}</li>,
				<li>{_this.renderValidationProjects(revision.id)}</li>
			];
		});

		return (
			<div className="box box-default">
				<div className="box-header with-border">
					<h3 className="box-title">
						<FormattedMessage
							id="revisionhistory.revision_history"
							defaultMessage="Revision History"
						/>
					</h3>
					<CreateRevisionBtn
						createNewRevision={this.createNewRevision}
						project={this.props.project}
						isProjectOwner={this.props.isProjectOwner}
					/>
				</div>
				<div className="box-body">
					<div id="revision-panel">
						<ul className="timeline list">{renderRevisions}</ul>
					</div>
				</div>
			</div>
		);
	}
}
