import React from 'react';

import CourseEndpoint from '../../../common/endpoints/CourseEndpoint';
import ExerciseEndpoint from '../../../common/endpoints/ExerciseEndpoint';

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
		this.getExercises();
	}

	getExercises() {
		var _this = this;
		ExerciseEndpoint.listTermCourseExercises(
			this.props.termCourse.getId()
		).then(function(resp) {
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
			</StyledListItemDefault>
		);
	}

	render() {
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
