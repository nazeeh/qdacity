import React from 'react';

import CourseEndpoint from '../../../common/endpoints/CourseEndpoint';
import ExerciseEndpoint from '../../../common/endpoints/ExerciseEndpoint';
import Theme from '../../../common/styles/Theme.js';

import {
	ItemList,
	ListMenu,
	StyledListItemBtn,
	StyledListItemPrimary,
	StyledListItemDefault,
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
			this.userPromise = this.props.account.getCurrentUser();
			this.getExercisesPromise = ExerciseEndpoint.listTermCourseExercises(this.props.termCourse.getId());
			this.getExercises();
		}

	}

	getExercises() {
		var _this = this;
		this.getExercisesPromise.then(function (resp) {
			resp.items = resp.items || [];
			_this.setState({
				exercises: resp.items
			});
		});
	}

	renderExercise(exercise, index) {
		return (
			<StyledListItemDefault key={index} className="clickable">
					<span > {exercise.name} </span>
						<div>
						<StyledListItemBtn onClick={(e) => this.editorClick(e, exercise, index)} className=" btn fa-lg" color={Theme.darkGreen} colorAccent={Theme.darkGreenAccent}>
							<i className="fa fa-tags"></i>
						</StyledListItemBtn>
					</div>
				</StyledListItemDefault>
		);
	}

	editorClick (e, exercise, index) {
		var _this = this;
		ExerciseEndpoint.getExerciseProjectByRevisionID(exercise.projectRevisionID).then(function (resp) {
			if (!(typeof (resp.revisionID) == 'undefined')) {
				//the ExerciseProject exists, check for validationCoders
				_this.userPromise.then(function (user) {
					if ((typeof (resp.validationCoders) == 'undefined') || (resp.validationCoders.find(o => o.id === user.id) == 'undefined')) {
						//User not found in validationCoders, add the user & open the CodingEditor
						ExerciseEndpoint.addValidationCoder(resp.id).then(function (exerciseProject){
							//_this.props.history.push('/CodingEditor?project=' + resp.revisionID + '&type=VALIDATION');
						})
					}
					else {
						//User found in validationCoders, simply open the CodingEditor
						//_this.props.history.push('/CodingEditor?project=' + resp.revisionID + '&type=VALIDATION');
					}
				});
			}
			else {
				//if the ExerciseProject doesn't exist, create the ExerciseProject then redirect to coding editor:
				ExerciseEndpoint.createExerciseProject(exercise.projectRevisionID, exercise.id).then (function (resp2) {
					//_this.props.history.push('/CodingEditor?project=' + resp2.id + '&type=VALIDATION');
				})
			}
		});
	}

	render() {

		var _this = this;

		if (!this.props.account.getProfile() || !this.props.account.isSignedIn()) return null;

		return (
					<ItemList
		                key={"itemlist"}
		                hasPagination={true}
		                itemsPerPage={8}
		                items={this.state.exercises}
		                renderItem={this.renderExercise} />
				);



	}


}
