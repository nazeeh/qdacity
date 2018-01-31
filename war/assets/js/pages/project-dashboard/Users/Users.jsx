import React from 'react';
import { FormattedMessage } from 'react-intl';

import UserList from './UserList.jsx';
import InviteUserField from './InviteUserField.jsx';

export default class Users extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div id="user-section">
				<div className="box box-default">
					<div className="box-header with-border">
						<h3 className="box-title">
							<FormattedMessage id="usersusers" defaultMessage="Users" />
						</h3>
					</div>
					<div className="box-body">
						<div className="List-menu">
							<InviteUserField
								project={this.props.project}
								isProjectOwner={this.props.isProjectOwner}
							/>
						</div>
						<div>
							<UserList
								project={this.props.project}
								isProjectOwner={this.props.isProjectOwner}
							/>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
