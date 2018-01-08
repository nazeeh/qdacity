import React from 'react';

import ExerciseList from "./ExerciseList.jsx"

export default class Exercises extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {

		return (
			<div id="user-section" className="box box-default">

				<div className="box-header with-border">
					<h3 className="box-title">Exercises</h3>
				</div>
				<div className="box-body">
					<div>
						<ExerciseList termCourse={this.props.termCourse}/>
					</div>
				</div>
		</div>);
	}
}
