import React from 'react';
import { FormattedMessage } from 'react-intl';

import UserList from "./UserList.jsx"
import InviteUserField from "./InviteUserField.jsx"

export default class Teachers extends React.Component {
	constructor(props) {
		super(props);
		this.state = {

		};
	}

	render() {
		if (this.props.isCourseOwner === false) return null;

		return (
			<div id="user-section" className="box box-default">

				<div className="box-header with-border">
					<h3 className="box-title">
						<FormattedMessage id='teachersteachers' defaultMessage='Teachers' />
					</h3>
				</div>
				<div className="box-body">
					<div className="List-menu">
						<InviteUserField course={this.props.course}/>
					</div>
					<div>
						<UserList course={this.props.course}/>
					</div>
				</div>
		</div>);
	}
}
