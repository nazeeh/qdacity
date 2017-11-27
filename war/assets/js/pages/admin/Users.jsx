import React from 'react'
import styled from 'styled-components';

import UserList from './UserList.jsx';

import UserEndpoint from '../../common/endpoints/UserEndpoint';

const StyledUserSearch = styled.div `
	display:flex;
	flex-direction:row;
	& > .searchfield{
		flex:1;
		margin-right: 5px;
	}
`;

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

export default class Users extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			users: [],
			search: '',
            selectedUserId: ''
        };

		this.updateSearch = this.updateSearch.bind(this);
		this.findUsers = this.findUsers.bind(this);
		this.removeUser = this.removeUser.bind(this);
	}

	updateSearch(e) {
		this.setState({
			search: e.target.value
		});
	}

	findUsers() {
		var _this = this;
		UserEndpoint.findUsers(this.state.search).then(function (resp) {
			_this.setState({
				users: resp.items
			});
		}).catch(function (resp) {
			_this.setState({
				users: []
			});
			window.alert(resp.code);
		});
	}

	removeUser(pId) {
		UserEndpoint.removeUser(pId).then(function (resp) {
			var index = this.state.users.findIndex(function (user, index, array) {
				return user.id == pId;
			});
			this.state.users.splice(index, 1);
			this.setState({
				users: this.state.users
			});
		});

	}

    setSelectedUserId(userId) {
        this.props.setSelectedUserId(userId)
        this.setState({
            selectedUserId: userId
        });
    }

	render() {
		return (
			<div className="box box-default">
				<div className="box-header with-border">
					<h3 className="box-title">Users</h3>
				</div>
				<div className="box-body">
					<StyledUserSearch>
						<StyledSearchField className="searchfield" id="searchform">
							<input
								type="text"
								className="search"
								placeholder="Search"
								value={this.state.search}
								onChange={this.updateSearch}
							/>
							<button id="userSearchFindBtn" type="button" id="search" onClick={this.findUsers}>Find!</button>
						</StyledSearchField>
					</StyledUserSearch>
					<UserList  users={this.state.users} removeUser={this.removeUser} setSelectedUserId={(userId) => this.setSelectedUserId(userId)}/>
					<ul id="user-list" className="list compactBoxList">
					</ul>
				</div>
			</div>
		);
	}
}