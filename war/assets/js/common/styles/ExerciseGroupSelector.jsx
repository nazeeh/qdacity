import React from 'react';
import styled from 'styled-components';
import DropDownButton from './DropDownButton.jsx';
import ExerciseEndpoint from '../../common/endpoints/ExerciseEndpoint';

const ProjectDropDownContainer = styled.div`
	display: flex;
	z-index: 10000 !important;
	margin: 3px;
`;

const labelContainer = styled.div`
	display: inline-block;
	margin-right: 5px !important;
`;

export default class ExerciseGroupSelector extends React.Component {
	constructor(props) {
		super(props);

		this.revisionSelectorRef = null;
		this.state = {
			termCourseID: this.props.termCourseID,
			exercises: [],
			exerciseGroups: [],
			exerciseNameList: [],
			exerciseInitText: []
		};
	}

	componentDidMount() {
		this.init();
	}

	init() {
		var _this = this;
		var exerciseNameList = [];
		var termCourseID = this.props.termCourseID;
		var modifiedExerciseGroups = [];
		//First get a list of exercises which belong to the term course whose id is passed to the ExerciseGroupSelector
		ExerciseEndpoint.listTermCourseExercises(termCourseID).then(function(
			exercises
		) {
			var exercisesStateList = [];
			exercises.items.forEach(function(exercise) {
				exercisesStateList.push(exercise);
				//Add the exercise name & its click event handler to the dropdown
				exerciseNameList.push({
					text: 'Exercise: ' + exercise.name,
					onClick: _this.exerciseClicked.bind(_this, exercise.id, exercise.projectRevisionID)
				});
			});
			//Then get a list of exercise groups which belong to the term course
			ExerciseEndpoint.listTermCourseExerciseGroups(termCourseID).then(function(
				exerciseGroups
			) {
				modifiedExerciseGroups = exerciseGroups;
				exerciseGroups.items.forEach(function(exerciseGroup, index) {
					var exerciseObjectsForGroup = [];
					//Iterate over the exercise ids in each group and find the corresponding exercises
					//then add them as objects to the modifiedExerciseGroup (which is eventually passed to the state)
					//This can be achieved by another backend call getExercisesOfExerciseGroup but it will consume one unneccessary api call
					if (typeof exerciseGroup.exercises !== 'undefined') {
						exerciseGroup.exercises.forEach(function(exerciseID) {
							var exerciseObject = exercisesStateList.find(
								thisExercise => thisExercise.id === exerciseID
							);
							exerciseObjectsForGroup.push(exerciseObject);
						});
					}
					modifiedExerciseGroups.items[
						index
					].exerciseObjects = exerciseObjectsForGroup;
				});
				modifiedExerciseGroups.items.forEach(function(modifiedExerciseGroup) {
					if (modifiedExerciseGroup.exerciseObjects.length > 0) {
						var groupDisplayName = 'Group: < ';
						//Form the name of each exercise group as its exercise names. E.g <Exercise 1, Exercise 2>
						modifiedExerciseGroup.exerciseObjects.forEach(function(
							exerciseObject,
							index,
							array
						) {
							if (index == array.length - 1) {
								groupDisplayName =
									groupDisplayName + exerciseObject.name + ' >';
							} else {
								groupDisplayName =
									groupDisplayName + exerciseObject.name + ', ';
							}
						});
						//Save the formed names & their click handlers in the list which is eventually passed to the state
						exerciseNameList.push({
							text: groupDisplayName,
							onClick: _this.exerciseGroupClicked.bind(
								_this,
								modifiedExerciseGroup.id,
								modifiedExerciseGroup.projectRevisionID
							)
						});
					}
				});
				_this.setState({
					exercises: exercisesStateList,
					exerciseGroups: modifiedExerciseGroups,
					exerciseNameList: exerciseNameList,
					exerciseInitText: exerciseNameList[0].text
				});
			});
		});
	}

	exerciseClicked(exerciseID, projectRevisionID) {
		this.props.setSelectedExerciseID(exerciseID, projectRevisionID);
	}

	exerciseGroupClicked(exerciseGroupID, projectRevisionID) {
		this.props.setSelectedExerciseGroupID(exerciseGroupID, projectRevisionID);
	}

	render() {
		return (
			<div>
				<ProjectDropDownContainer>
					<labelContainer>
						<label>Select an exercise or an exercise group: </label>
					</labelContainer>
					<DropDownButton
						isListItemButton={true}
						items={this.state.exerciseNameList}
						initText={this.state.exerciseInitText}
					/>
				</ProjectDropDownContainer>
			</div>
		);
	}
}
