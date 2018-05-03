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

		ExerciseEndpoint.listTermCourseExercises(termCourseID).then(function(exercises) {
			exercises.items.forEach(function(exercise) {
				exerciseNameList.push({
					text: exercise.name,
					onClick: _this.exerciseClicked.bind(_this, exercise.id)
				});
			});
			_this.setState({
				exercises: exercises,
				exerciseNameList: exerciseNameList,
				exerciseInitText: exerciseNameList[0].text
			});
		});
	}

	exerciseClicked(exerciseID) {
		this.props.setSelectedExerciseID(exerciseID);
	}

	render() {
		return (
			<div>
				<ProjectDropDownContainer>
					<labelContainer>
						<label>Select an exercise: </label>
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
