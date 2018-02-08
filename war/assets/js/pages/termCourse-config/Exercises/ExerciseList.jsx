import React from 'react';
import { FormattedMessage } from 'react-intl';

import CourseEndpoint from '../../../common/endpoints/CourseEndpoint';
import ExerciseEndpoint from '../../../common/endpoints/ExerciseEndpoint';
import ProjectEndpoint from '../../../common/endpoints/ProjectEndpoint';
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

import { BtnDefault } from '../../../common/styles/Btn.jsx';

const StyledNewExBtn = styled.div`
	padding-bottom: 5px;
`;

export default class ExerciseList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			exercises: [],
			projects: [],
			// pagination
			currentPage: 1,
			itemsPerPage: 5
		};

		this.init();

		this.renderExercise = this.renderExercise.bind(this);
		this.showNewExerciseModal = this.showNewExerciseModal.bind(this);
	}

	init() {
		if (!this.userPromise) {
			this.userPromise = this.props.auth.authentication.getCurrentUser();
			this.getExercisesPromise = ExerciseEndpoint.listTermCourseExercises(
				this.props.termCourse.getId()
			);
			this.fetchTermCourseData();
		}
	}

	fetchTermCourseData() {
		var _this = this;
		var projects = [];
		this.getExercisesPromise.then(function(resp) {
			resp.items = resp.items || [];
			_this.userPromise.then(function(userAccount) {
				ProjectEndpoint.listProjectByUserId(userAccount.id).then(function(
					projectsResp
				) {
					_this.setState({
						exercises: resp.items,
						projects: projectsResp
					});
				});
			});
		});
	}

	showNewExerciseModal() {
		const { formatMessage } = IntlProvider.intl;
		var _this = this;

		var modal = new CustomForm(
			formatMessage(
				{
					id: 'ExerciseList.createNewExercise',
					defaultMessage: 'Create a new exercise'
				},
				''
			)
		);
		modal.addDropDown(this.state.projects);
		modal.addTextInput(
			'name',
			formatMessage({
				id: 'ExerciseList.name',
				defaultMessage: 'Exercise Name: '
			}),
			'Name',
			''
		);
		modal.showModal().then(function(data) {
			_this.createNewExercise(data.name, data.SelectedRevisionID);
		});
	}

	createNewExercise(name, projectRevisionID) {
		var _this = this;
		var exercise = {};
		var termCourseID = this.props.termCourse.id;
		var exercises = this.state.exercises;
		exercise.name = name;
		exercise.projectRevisionID = projectRevisionID;
		exercise.termCourseID = termCourseID;
		ExerciseEndpoint.insertExercise(exercise).then(function(resp) {
			exercises.push(resp);
			_this.setState({
				exercises: exercises
			});
		});
	}

	deleteExercise(e, exercise) {
		const { formatMessage } = IntlProvider.intl;
		var _this = this;
		var exercises = this.state.exercises;
		e.stopPropagation();
		var confirm = new Confirm(
			formatMessage(
				{
					id: 'exerciselist.delete_excercise',
					defaultMessage: 'Do you want to delete the exercise {name}?'
				},
				{
					name: exercise.name
				}
			)
		);
		confirm.showModal().then(function() {
			ExerciseEndpoint.removeExercise(exercise.id).then(function(resp) {
				var index = exercises.indexOf(
					exercises.find(o => o.id === exercise.id)
				);
				exercises.splice(index, 1);
				_this.setState({
					exercises: exercises
				});
			});
		});
	}

	renderNewExerciseButton() {
		return (
			<StyledNewExBtn>
				<BtnDefault onClick={this.showNewExerciseModal}>
					<i className="fa fa-plus fa-fw" />
					<FormattedMessage
						id="exerciselist.new_excercise"
						defaultMessage="New Exercise"
					/>
				</BtnDefault>
			</StyledNewExBtn>
		);
	}

	renderExercise(exercise, index) {
		return (
			<StyledListItemDefault key={index} className="clickable">
				<span> {exercise.name} </span>
				<div>
					<StyledListItemBtn
						onClick={e => this.deleteExercise(e, exercise, index)}
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

	render() {
		var _this = this;

		if (!this.props.auth.authentication.isSignedIn()) return null;

		return (
			<div>
				{this.renderNewExerciseButton()}

				<ItemList
					key={'itemlist'}
					hasPagination={true}
					itemsPerPage={8}
					items={this.state.exercises}
					renderItem={this.renderExercise}
				/>
			</div>
		);
	}
}
