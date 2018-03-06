import React from 'react';
import { FormattedMessage } from 'react-intl';

import ExerciseProjectReportList from './ExerciseProjectReportList.jsx';

export default class ExerciseProjectReports extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div id="user-section" className="box box-default">
				<div className="box-header with-border">
					<h3 className="box-title">
						<FormattedMessage
							id="exerciseProjectReports.exerciseProjectReports"
							defaultMessage="Exercise Project Reports"
						/>
					</h3>
				</div>
				<div className="box-body">
					<div>
						<ExerciseProjectReportList
							exercise={this.props.exercise}
							auth={this.props.auth}
							history={this.props.history}
						/>
					</div>
				</div>
			</div>
		);
	}
}
