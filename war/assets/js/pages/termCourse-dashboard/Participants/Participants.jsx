import React from 'react';

import UserList from "./UserList.jsx"

export default class Participants extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		//if (this.props.isCourseOwner === false) return null;

		return (
			<div id="user-section" className="box box-default">

				<div className="box-header with-border">
					<h3 className="box-title">Participants</h3>
				</div>
				<div className="box-body">
					<div>
						<UserList termCourse={this.props.termCourse}/>
					</div>
				</div>
		</div>);
	}
}
