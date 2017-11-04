import React from 'react';
import styled from 'styled-components';

import CourseEndPoint from '../../../common/endpoints/CourseEndpoint';

import {
	BtnDefault
} from '../../../common/styles/Btn.jsx';
import StyledSearchField from '../../../common/styles/SearchField.jsx';

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
		CourseEndPoint.inviteUser(this.props.course.getId(), this.state.userEmail).then(function (resp) {
			alertify.success(_this.state.userEmail + " has been invited");
		}).catch(function (resp) {
			alertify.error(_this.state.userEmail + " was not found");
		});
	}

	render() {
		var _this = this;

		return (<StyledSearchField>
				<input
					type="text"
					placeholder="User Email"
					value={this.state.userEmail}
					onChange={this.updateUserEmail}
					onKeyPress={(e) => { if (e.key === 'Enter') this.inviteUser();}}>
				</input>
				<BtnDefault type="button" onClick={this.inviteUser}>
					<i className="fa fa-paper-plane  fa-lg"></i> Invite
				</BtnDefault>
			</StyledSearchField>);
	}


}
