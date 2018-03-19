import React from 'react';

import CourseEndpoint from '../../../common/endpoints/CourseEndpoint';
import ExerciseEndpoint from '../../../common/endpoints/ExerciseEndpoint';
import Theme from '../../../common/styles/Theme.js';

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
				this.props.termCourse.getId()
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
						if (!(_this.deadlinePassed(exercise))) {
							_this.props.history.push(
								'/CodingEditor?project=' + exerciseProjectResp.id + '&type=EXERCISE'
							);
						}
						else {
							//Show an alert and call the editor in read only mode
							alert("The deadline for this exercise has passed, you will only be able to view your project without editing");
							_this.props.history.push(
								'/CodingEditor?project=' + exerciseProjectResp.id + '&type=EXERCISE' + '&readOnly=true'
							);
							}
					});
			} else {
				if (!(_this.deadlinePassed(exercise))) {
					_this.props.history.push(
						'/CodingEditor?project=' + resp2.id + '&type=EXERCISE'
					);
				}
				else {
					//Show an alert and call the editor in read only mode
					alert("The deadline for this exercise has passed, you will only be able to view the project without editing");
					_this.props.history.push(
						'/CodingEditor?project=' + resp2.id + '&type=EXERCISE' + '&readOnly=true'
					);
				}
			}
		});
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
