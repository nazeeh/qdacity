import React from 'react';

import CourseEndpoint from '../../../common/endpoints/CourseEndpoint';
import ExerciseEndpoint from '../../../common/endpoints/ExerciseEndpoint';
import Theme from '../../../common/styles/Theme.js';
import Alert from '../../../common/modals/Alert';
import { FormattedMessage } from 'react-intl';
import IntlProvider from '../../../common/Localization/LocalizationProvider';
import IntercoderAgreement from '../../../common/modals/IntercoderAgreement';

import {
	ItemList,
	ListMenu,
	StyledListItemBtn,
	StyledListItemPrimary,
	StyledListItemDefault
} from '../../../common/styles/ItemList.jsx';

export default class ExerciseList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			exercises: []
		};

		this.init();

		this.renderExercise = this.renderExercise.bind(this);
	}

	init() {
		if (!this.userPromise) {
			this.userPromise = this.props.auth.authentication.getCurrentUser();
			this.getExercisesPromise = ExerciseEndpoint.listTermCourseExercises(
				this.props.termCourse.id
			);
			this.getExercises();
		}
	}

	getExercises() {
		var _this = this;
		var exercises = [];
		this.getExercisesPromise.then(function(resp) {
			resp.items = resp.items || [];
			var counter = resp.items.length;
			resp.items.forEach(function(exercise, index) {
				ExerciseEndpoint.listExerciseReportsByRevisionID(
					exercise.projectRevisionID,
					exercise.id
				).then(function(resp2) {
					counter -= 1;
					resp2.items = resp2.items || [];
					exercises[index] = exercise;
					exercises[index].exerciseReport = resp2.items;
					if (counter == 0) {
						_this.setState({
							exercises: exercises
						});
					}
				});
			});
		});
	}

	renderExercise(exercise, index) {
		var _this = this;
		const { formatMessage } = IntlProvider.intl;
		return (
			<StyledListItemDefault key={index} className="clickable">
				<span> {exercise.name} </span>
				<span>
					{' '}
					{formatMessage(
						{
							id: 'exerciselist.exercise_deadline',
							defaultMessage: 'Deadline: {deadline}'
						},
						{
							deadline: exercise.exerciseDeadline.substr(0, 10)
						}
					)}{' '}
				</span>
				<div>
					<StyledListItemBtn
						onClick={e => this.editorClick(e, exercise, index)}
						className=" btn fa-lg"
						color={Theme.darkGreen}
						colorAccent={Theme.darkGreenAccent}
					>
						<i className="fa fa-tags" />
					</StyledListItemBtn>
					{_this.renderReports(exercise, index)}
				</div>
			</StyledListItemDefault>
		);
	}

	renderReports(exercise, index) {
		if (
			typeof exercise.exerciseReport !== 'undefined' &&
			exercise.exerciseReport.length > 0
		) {
			return (
				<StyledListItemBtn
					onClick={e => this.exerciseReportClick(e, exercise, index)}
					className=" btn fa-lg"
					color={Theme.darkGreen}
					colorAccent={Theme.darkGreenAccent}
				>
					<i className="fa fa-industry" />
				</StyledListItemBtn>
			);
		}
	}
	editorClick(e, exercise, index) {
		var _this = this;
		ExerciseEndpoint.createExerciseProjectIfNeeded(
			exercise.projectRevisionID,
			exercise.id
		).then(function(resp2) {
			if (typeof resp2.id == 'undefined') {
				ExerciseEndpoint.getExerciseProjectByRevisionID(
					exercise.projectRevisionID,
					exercise.id
				).then(function(exerciseProjectResp) {
					_this.props.history.push(
						'/CodingEditor?project=' + exerciseProjectResp.id + '&type=EXERCISE'
					);
					_this.showAlertIfDeadlinePassed(exercise);
				});
			} else {
				_this.props.history.push(
					'/CodingEditor?project=' + resp2.id + '&type=EXERCISE'
				);
				_this.showAlertIfDeadlinePassed(exercise);
			}
		});
	}

	exerciseReportClick(e, exercise, index) {
		var agreementModal = new IntercoderAgreement(
			exercise.exerciseReport[0],
			this.props.history,
			'EXERCISE',
			exercise
		);
		agreementModal.showModal();
	}
	showAlertIfDeadlinePassed(exercise) {
		const { formatMessage } = IntlProvider.intl;
		if (this.deadlinePassed(exercise)) {
			new Alert(
				formatMessage({
					id: 'exercise.deadlinePassed',
					defaultMessage:
						'The deadline for this exercise has passed.\n' +
						' Any changes you make will not be taken into account\n' +
						' when the exercise is evaluated.'
				})
			).showModal();
		}
	}

	javaToJSDate(javaDateString) {
		var year;
		var month;
		var day;
		var hour = 0;
		var minute = 0;
		var second = 0;
		var millisecond = 0;
		var JSExerciseDeadline = new Date();
		if (typeof javaDateString != 'undefined') {
			year = javaDateString.substr(0, javaDateString.indexOf('-'));
			javaDateString = javaDateString.substr(javaDateString.indexOf('-') + 1);
			month = javaDateString.substr(0, javaDateString.indexOf('-'));
			javaDateString = javaDateString.substr(javaDateString.indexOf('-') + 1);
			day = javaDateString.substr(0, javaDateString.indexOf('T'));
			javaDateString = javaDateString.substr(javaDateString.indexOf('T') + 1);
			JSExerciseDeadline.setFullYear(year);
			JSExerciseDeadline.setMonth(month - 1);
			JSExerciseDeadline.setDate(day);
			JSExerciseDeadline.setHours(hour);
			JSExerciseDeadline.setMinutes(minute);
			JSExerciseDeadline.setSeconds(second);
			JSExerciseDeadline.setMilliseconds(millisecond);
		} else {
			//If the deadline of the exercise is undefined in the datastore, set it to one year later here
			JSExerciseDeadline.setFullYear(JSExerciseDeadline.getFullYear() + 1);
		}
		return JSExerciseDeadline;
	}
	deadlinePassed(exercise) {
		var JSExerciseDeadline = this.javaToJSDate(exercise.exerciseDeadline);
		var now = new Date();
		if (JSExerciseDeadline < now) {
			return true;
		} else {
			return false;
		}
	}

	render() {
		var _this = this;

		if (!this.props.auth.authentication.isSignedIn()) return null;

		return (
			<div id="exerciseList">
			<ItemList id="exerciseList"
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
