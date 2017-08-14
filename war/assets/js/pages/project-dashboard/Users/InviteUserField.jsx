import React from 'react';
import styled from 'styled-components';

import ProjectEndpoint from '../../../common/endpoints/ProjectEndpoint';

const StyledSearchField = styled.div `
	float: none;
	width: 100%;
	display:flex;
	flex-direction:row;
	margin-bottom: 5px;
	& > input[type=text] {
		flex:1;
	    padding:0.3em;
	    border:0.2em solid #337ab7;
	    border-radius: 5px 0px 0px 5px;
	}
	& > button {
	  padding:0.6em 0.8em;
	  background-color:#337ab7;
	  color:white;
	  border:none;
	  border-radius: 0px 5px 5px 0px;
	}

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

		return (<StyledSearchField className="searchfield">
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
			</StyledSearchField>);
	}


}