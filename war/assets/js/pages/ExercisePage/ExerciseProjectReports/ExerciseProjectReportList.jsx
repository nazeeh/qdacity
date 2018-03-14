import React from 'react';
import { FormattedMessage } from 'react-intl';

import CourseEndpoint from '../../../common/endpoints/CourseEndpoint';
import ExerciseEndpoint from '../../../common/endpoints/ExerciseEndpoint';
import DocumentsEndpoint from '../../../common/endpoints/DocumentsEndpoint';
import styled from 'styled-components';
import CustomForm from '../../../common/modals/CustomForm';
import Theme from '../../../common/styles/Theme.js';
import Confirm from '../../../common/modals/Confirm';
import IntlProvider from '../../../common/Localization/LocalizationProvider';
import IntercoderAgreement from '../../../common/modals/IntercoderAgreement';

import {
	ItemList,
	ListMenu,
	StyledListItemBtn,
	StyledListItemPrimary,
	StyledListItemDefault
} from '../../../common/styles/ItemList.jsx';
const SyledCreateReportBtn = BtnDefault.extend`
	margin-top: -6px;
	margin-bottom: 6px;
`;
const StyledBtnIcon = styled.i`
	font-size: 18px;
`;

import { BtnDefault } from '../../../common/styles/Btn.jsx';

const StyledNewExBtn = styled.div`
	padding-bottom: 5px;
`;

export default class ExerciseProjectReportList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			exerciseProjectReports: []
		};

		this.init();

		this.renderExerciseProjectReport = this.renderExerciseProjectReport.bind(
			this
		);
	}

	init() {
		if (!this.userPromise) {
			this.userPromise = this.props.auth.authentication.getCurrentUser();

			this.getExerciseProjectReportsPromise = ExerciseEndpoint.listExerciseReportsByRevisionID(
				this.props.exercise.projectRevisionID
			);
			this.fetchExerciseReportData();
		}
	}

	fetchExerciseReportData() {
		var _this = this;
		this.getExerciseProjectReportsPromise.then(function(resp) {
			resp.items = resp.items || [];
			_this.setState({
				exerciseProjectReports: resp.items
			});
		});
	}

	deleteExerciseProjectReportClick(e, exerciseProjectReport, index) {
		const { formatMessage } = IntlProvider.intl;
		var _this = this;
		e.stopPropagation();
		var exerciseEndpoint = new ExerciseEndpoint();

		exerciseEndpoint
			.deleteExerciseProjectReport(exerciseProjectReport.id)
			.then(function(val) {
				alertify.success(
					formatMessage({
						id: 'reportlist.report_deleted',
						defaultMessage: 'Report has been deleted'
					})
				);
				_this.state.exerciseProjectReports.splice(index, 1);
				_this.setState({
					exerciseProjectReports: _this.state.exerciseProjectReports
				});
			});
	}

	createReport(revId) {
		const { formatMessage } = IntlProvider.intl;
		var _this = this;
		var exerciseEndpoint = new ExerciseEndpoint();
		DocumentsEndpoint.getDocuments(revId, 'EXERCISE').then(function(documents) {
			var modal = new CustomForm(
				formatMessage({
					id: 'exercisePage.create_validation_report',
					defaultMessage: 'Create Evaluation Report'
				})
			);
			modal.addTextInput(
				'title',
				formatMessage({
					id: 'exercisePage.report_title',
					defaultMessage: 'Report Title'
				}),
				'',
				''
			);
			var documentTitles = [];

			modal.addCheckBoxes('docs', documents);

			//TODO should not be hardcoded here
			var methods = ['f-measure'];
			var units = ['paragraph', 'sentence'];

			modal.addSelect(
				'method',
				methods,
				formatMessage({
					id: 'exercisePage.evaluation_method',
					defaultMessage: 'Evaluation Method'
				})
			);
			modal.addSelect(
				'unit',
				units,
				formatMessage({
					id: 'exercisePage.unit_of_coding',
					defaultMessage: 'Unit of Coding'
				})
			);

			modal.showModal().then(function(data) {
				var selectedDocs = [];
				exerciseEndpoint
					.evaluateExerciseRevision(
						this.props.exercise.id,
						revId,
						data.title,
						data.docs,
						data.method,
						data.unit
					) //TODO
					.then(function(val) {
						alertify.success(
							formatMessage({
								id: 'exercisePage.report_initiated',
								defaultMessage: 'Report Initiated. This may take a few minutes'
							})
						);
					})
					.catch(this.handleBadResponse);
			});
		});
	}

	showExerciseReports(exerciseProjectReport) {
		var agreementModal = new IntercoderAgreement(
			exerciseProjectReport,
			this.props.history,
			'EXERCISE'
		);
		if (this.props.isTermCourseOwner) agreementModal.showModal();
	}

	renderExerciseProjectReport(exerciseProjectReport, index) {
		return (
			<StyledListItemDefault
				key={index}
				className="clickable"
				onClick={() => this.showExerciseReports(exerciseProjectReport)}
			>
				<span> {exerciseProjectReport.name} </span>
				<div>
					<StyledListItemBtn
						onClick={e =>
							this.deleteExerciseProjectReportClick(
								e,
								exerciseProjectReport,
								index
							)
						}
						className=" btn fa-lg"
						color={Theme.rubyRed}
						colorAccent={Theme.rubyRedAccent}
					>
						<i className="fa fa-trash " />
					</StyledListItemBtn>
				</div>
			</StyledListItemDefault>
		);
	}

	renderCreateReportBtn(revId) {
		return (
			<SyledCreateReportBtn
				onClick={() => this.createReport(revId)}
				className=" pull-right"
			>
				<StyledBtnIcon className="fa fa-plus-circle" />
				<FormattedMessage
					id="exercisePage.create_report"
					defaultMessage="Create Evaluation Reports"
				/>
			</SyledCreateReportBtn>
		);
	}

	render() {
		var _this = this;
		if (!this.props.auth.authentication.isSignedIn()) return null;

		return (
			<div>
				{this.renderCreateReportBtn(this.props.exercise.projectRevisionID)}

				<ItemList
					key={'itemlist'}
					hasPagination={true}
					itemsPerPage={8}
					items={this.state.exerciseProjectReports}
					renderItem={this.renderExerciseProjectReport}
				/>
			</div>
		);
	}
}
