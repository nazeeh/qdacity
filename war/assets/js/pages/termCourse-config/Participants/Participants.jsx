import React from 'react';

import UserList from './UserList.jsx';
import InviteUserField from './InviteUserField.jsx';

export default class Participants extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div id="user-section" className="box box-default">
				<div className="box-header with-border">
					<h3 className="box-title">Participants</h3>
				</div>
				<div className="box-body">
					<div className="List-menu">
						<InviteUserField termCourse={this.props.termCourse} />
					</div>
					<div>
						<UserList termCourse={this.props.termCourse} />
					</div>
				</div>
			</div>
		);
	}
}
