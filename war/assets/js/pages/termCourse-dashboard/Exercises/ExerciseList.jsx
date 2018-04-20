import React from 'react';

import CourseEndpoint from '../../../common/endpoints/CourseEndpoint';
import ExerciseEndpoint from '../../../common/endpoints/ExerciseEndpoint';
import Theme from '../../../common/styles/Theme.js';
import Alert from '../../../common/modals/Alert';
import { FormattedMessage } from 'react-intl';
import IntlProvider from '../../../common/Localization/LocalizationProvider';

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
		this.getExercisesPromise.then(function(resp) {
			resp.items = resp.items || [];
			_this.setState({
				exercises: resp.items
			});
		});
	}

	renderExercise(exercise, index) {
		return (
			<StyledListItemDefault key={index} className="clickable">
				<span> {exercise.name} </span>
				<div>
					<StyledListItemBtn
						onClick={e => this.editorClick(e, exercise, index)}
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

	editorClick(e, exercise, index) {
		var _this = this;
		ExerciseEndpoint.createExerciseProjectIfNeeded(
			exercise.projectRevisionID,
			exercise.id
		).then(function(resp2) {
			if (typeof resp2.id == 'undefined') {
					ExerciseEndpoint.getExerciseProjectByRevisionID(
						exercise.projectRevisionID
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

	showAlertIfDeadlinePassed(exercise) {
		const { formatMessage } = IntlProvider.intl;
		if ((this.deadlinePassed(exercise))) {
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
			year = javaDateString.substr(0, javaDateString.indexOf("-"));
			javaDateString = javaDateString.substr(javaDateString.indexOf("-")+1);
			month = javaDateString.substr(0, javaDateString.indexOf("-"));
			javaDateString = javaDateString.substr(javaDateString.indexOf("-")+1);
			day = javaDateString.substr(0, javaDateString.indexOf("T"));
			javaDateString = javaDateString.substr(javaDateString.indexOf("T")+1);
			JSExerciseDeadline.setFullYear(year);
			JSExerciseDeadline.setMonth(month - 1);
			JSExerciseDeadline.setDate(day);
			JSExerciseDeadline.setHours(hour);
			JSExerciseDeadline.setMinutes(minute);
			JSExerciseDeadline.setSeconds(second);
			JSExerciseDeadline.setMilliseconds(millisecond);
		}
		else {
			//If the deadline of the exercise is undefined in the datastore, set it to one year later here
			JSExerciseDeadline.setFullYear(JSExerciseDeadline.getFullYear()+1);
		}
		return (JSExerciseDeadline);
	}
	deadlinePassed(exercise) {
		var JSExerciseDeadline = this.javaToJSDate(exercise.exerciseDeadline);
		var now = new Date();
		if (JSExerciseDeadline < now) {
			return true;
		}
		else
		{
			return false;
		}
	}

	render() {
		var _this = this;

		if (!this.props.auth.authentication.isSignedIn()) return null;

		return (
			<ItemList
				key={'itemlist'}
				hasPagination={true}
				itemsPerPage={8}
				items={this.state.exercises}
				renderItem={this.renderExercise}
			/>
		);
	}
}
