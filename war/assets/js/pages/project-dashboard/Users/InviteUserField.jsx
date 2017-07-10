import React from 'react';
import styled from 'styled-components';

import ProjectEndpoint from '../../../common/endpoints/ProjectEndpoint';

const StyledInvitationField = styled.span `
	width: 100%;
`;

export default class InviteUserField extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			userEmail: ''
		};
		this.updateUserEmail = this.updateUserEmail.bind(this);
		this.inviteUser = this.inviteUser.bind(this);
	}

	updateUserEmail(e) {
		this.setState({
			userEmail: e.target.value
		});

	}

	inviteUser() {
		var _this = this;
		ProjectEndpoint.inviteUser(this.props.project.getId(), this.state.userEmail).then(function (resp) {
			alertify.success(_this.state.userEmail + " has been invited");
		}).catch(function (resp) {
			alertify.error(_this.state.userEmail + " was not found");
		});
	}

	render() {
		if (this.props.isProjectOwner === false) return null;

		var _this = this;

		return (<StyledInvitationField className="searchfield">
				<input
					type="text"
					placeholder="User Email"
					value={this.state.userEmail}
					onChange={this.updateUserEmail}
					onKeyPress={(e) => { if (e.key === 'Enter') this.inviteUser();}}>
				</input>
				<button type="button" onClick={this.inviteUser}>
					Invite
				</button>
			</StyledInvitationField>);
	}


}