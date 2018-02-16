import React from 'react';
import { FormattedMessage } from 'react-intl';

import CourseEndpoint from '../../../common/endpoints/CourseEndpoint';
import ExerciseEndpoint from '../../../common/endpoints/ExerciseEndpoint';
import ProjectEndpoint from '../../../common/endpoints/ProjectEndpoint';
import DocumentsEndpoint from '../../../common/endpoints/DocumentsEndpoint';
import styled from 'styled-components';
import CustomForm from '../../../common/modals/CustomForm';
import Theme from '../../../common/styles/Theme.js';
import Confirm from '../../../common/modals/Confirm';
import IntlProvider from '../../../common/Localization/LocalizationProvider';

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

export default class ExerciseProjectList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			exerciseProjects: []
		};

		this.init();

		this.renderExerciseProject = this.renderExerciseProject.bind(this);
	}

	init() {
		if (!this.userPromise) {
			this.userPromise = this.props.auth.authentication.getCurrentUser();
			this.getExerciseProjectsPromise = ExerciseEndpoint.getExerciseProjectsByExerciseID(
				this.props.exercise.id
			);
			this.fetchExerciseData();
		}
	}

	fetchExerciseData() {
		var _this = this;
		this.getExerciseProjectsPromise.then(function(resp) {
			resp.items = resp.items || [];
			_this.setState({
				exerciseProjects: resp.items
			});
		});
	}

	editorClick(e, exerciseProject) {
		var _this = this;
		this.props.history.push(
			'/CodingEditor?project=' + exerciseProject.id + '&type=EXERCISE'
		);
	}

	createReport(exerciseID) {
		const { formatMessage } = IntlProvider.intl;
		var projectEndpoint = new ProjectEndpoint();
		DocumentsEndpoint.getDocuments(exerciseID, 'EXERCISE').then(function(documents) {
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
				
			});
		});
	}

	renderExerciseProject(exerciseProject, index) {
		return (
			<StyledListItemDefault key={index} className="clickable">
				<span> {exerciseProject.creatorName} </span>
				<div>
					<StyledListItemBtn
						onClick={e => this.editorClick(e, exerciseProject)}
						className=" btn fa-lg"
						color={Theme.darkGreen}
						colorAccent={Theme.darkGreenAccent}
					>
						<i className="fa fa-tags" />
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

				{this.renderCreateReportBtn(this.props.exercise.id)}

				<ItemList
					key={'itemlist'}
					hasPagination={true}
					itemsPerPage={8}
					items={this.state.exerciseProjects}
					renderItem={this.renderExerciseProject}
				/>
			</div>
		);
	}
}
