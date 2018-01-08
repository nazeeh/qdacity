import React from 'react';
import {FormattedMessage} from 'react-intl';

import ExerciseList from "./ExerciseList.jsx"

export default class Exercises extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		//if (this.props.isCourseOwner === false) return null;

		return (
			<div id="user-section" className="box box-default">

				<div className="box-header with-border">
					<h3 className="box-title"><FormattedMessage id='excercises.excercises' defaultMessage='Exercises' /></h3>
				</div>
				<div className="box-body">
					<div>
						<ExerciseList termCourse={this.props.termCourse} history={this.props.history} account={this.props.account}/>
					</div>
				</div>
		</div>);
	}
}
