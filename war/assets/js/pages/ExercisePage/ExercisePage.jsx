import React from 'react';
import IntlProvider from '../../common/Localization/LocalizationProvider';
import styled from 'styled-components';
import Theme from '../../common/styles/Theme.js';

import ExerciseEndpoint from '../../common/endpoints/ExerciseEndpoint';
import CourseEndpoint from '../../common/endpoints/CourseEndpoint';
import 'script-loader!../../../../components/URIjs/URI.min.js';
import 'script-loader!../../../../components/alertify/alertify-0.3.js';
import Exercise from './Exercise';
import ExerciseProjects from './ExerciseProjects/ExerciseProjects.jsx';
import ExerciseProjectReports from './ExerciseProjectReports/ExerciseProjectReports.jsx';
import BtnDefault from '../../common/styles/Btn.jsx';
import Confirm from '../../common/modals/Confirm';
import UnauthenticatedUserPanel from '../../common/UnauthenticatedUserPanel.jsx';

const StyledNewPrjBtn = styled.div`
	padding-left: 5px;
`;
const StyledDashboard = styled.div`
	margin-top: 70px;
	margin-left: auto;
	margin-right: auto;
	width: 1170px;
	display: grid;
	grid-template-columns: 6fr 6fr;
	grid-template-areas:
		'titlerow titlerow'
		'terms teachers';
	grid-column-gap: 20px;
`;

const StyledTitleRow = styled.div`
	grid-area: titlerow;
`;

export default class ExercisePage extends React.Component {
	constructor(props) {
		super(props);

		var urlParams = URI(window.location.search).query(true);
		this.exerciseId = urlParams.exercise;

		this.state = {
			exercise: undefined,
			isTermCourseOwner: false
		};
	}

	init() {
		if (!this.userPromise) {
			this.userPromise = this.props.auth.authentication.getCurrentUser();
			this.getExerciseByIDPromise = ExerciseEndpoint.getExerciseByID(
				this.exerciseId
			);

			this.setExerciseInfo();
		}
	}

	async setExerciseInfo() {
		const exercise = await this.getExerciseByIDPromise;

		const parentTermCourse = await CourseEndpoint.getTermCourse(
			exercise.termCourseID
		);
		const parentCourse = await CourseEndpoint.getCourse(
			parentTermCourse.courseID
		);
		
		const user = await this.userPromise;


		const isTermCourseOwner = this.props.auth.authorization.isTermCourseOwner(
			user,
			parentTermCourse,
			parentCourse
		);

		this.setState({
			exercise: exercise,
			isTermCourseOwner: isTermCourseOwner
		});
	}

	renderExerciseProjects() {
		var isUserTermCourseOwner = this.state.isTermCourseOwner;
		if (!isUserTermCourseOwner) {
			return '';
		} else {
			return (
				<ExerciseProjects
					exercise={this.state.exercise}
					auth={this.props.auth}
					history={this.props.history}
				/>
			);
		}
	}

	renderExerciseProjectReports() {
		var isUserTermCourseOwner = this.state.isTermCourseOwner;
		if (!isUserTermCourseOwner) {
			return '';
		} else {
			return (
				<ExerciseProjectReports
					exercise={this.state.exercise}
					auth={this.props.auth}
					isTermCourseOwner={this.state.isTermCourseOwner}
					history={this.props.history}
				/>
			);
		}
	}

	render() {
		if (!this.props.auth.authState.isUserSignedIn) {
			return (
				<UnauthenticatedUserPanel
					history={this.props.history}
					auth={this.props.auth}
				/>
			);
		}

		this.init();
		if (this.state.exercise == undefined || this.state.exercise == null)
			return null;

		return (
			<StyledDashboard>
				{this.renderExerciseProjects()}
				{this.renderExerciseProjectReports()}
			</StyledDashboard>
		);
	}
}
