import React from 'react'
import styled from 'styled-components';

import UserList from './UserList.jsx';

import UserEndpoint from '../../common/endpoints/UserEndpoint';
import StyledSearchField from '../../common/styles/SearchField.jsx';
import {
	BtnDefault
} from "../../common/styles/Btn.jsx";

const StyledUserSearch = styled.div `
	display:flex;
	flex-direction:row;
	& > .searchfield{
		flex:1;
		margin-right: 5px;
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
		this.onSearchFieldKeyPress = this.onSearchFieldKeyPress.bind(this);
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
			_this.setSelectedUserId(null)
		}).catch(function (resp) {
			_this.setState({
				users: []
			});
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

	onSearchFieldKeyPress(event) {
		if (event.key === "Enter") {
			this.findUsers();
		}
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
                                onKeyPress={this.onSearchFieldKeyPress}
							/>
							<BtnDefault id="btnSearch" onClick={this.findUsers}>
								<i className="fa fa-search"/>
							</BtnDefault>
						</StyledSearchField>
					</StyledUserSearch>
					<UserList  users={this.state.users} removeUser={this.removeUser} setSelectedUserId={(userId) => this.setSelectedUserId(userId)} selectedUserId={this.state.selectedUserId}/>
					<ul id="user-list" className="list compactBoxList">
					</ul>
				</div>
			</div>
		);
	}
}