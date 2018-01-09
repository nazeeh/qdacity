import React from 'react'
import {
	FormattedMessage
} from 'react-intl';
import styled from 'styled-components';

import UserList from './UserList.jsx';

import UserEndpoint from '../../common/endpoints/UserEndpoint';

import {
	SearchBox,
	StyledSearchFieldContainer
} from '../../common/styles/SearchBox.jsx';

import {
	BtnDefault
} from "../../common/styles/Btn.jsx";

const StyledUserSearch = StyledSearchFieldContainer.extend `
	& > .searchfield{
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
		this.onSearchFieldKeyPress = this.onSearchFieldKeyPress.bind(this);
		this.findUsers = this.findUsers.bind(this);
		this.removeUser = this.removeUser.bind(this);
	}

	updateSearch(text) {
		this.setState({
			search: text
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
			_this.setSelectedUserId(null)
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
					<h3 className="box-title"><FormattedMessage id='usersusers' defaultMessage='Users' /></h3>
				</div>
				<div className="box-body">
					<StyledUserSearch>
                        <SearchBox onSearch={this.updateSearch} onKeyPress={this.onSearchFieldKeyPress} />  
						<BtnDefault id="btnSearch" onClick={this.findUsers}>
							<i className="fa fa-search"/>
						</BtnDefault>			
					</StyledUserSearch>
					<UserList  users={this.state.users} removeUser={this.removeUser} setSelectedUserId={(userId) => this.setSelectedUserId(userId)} selectedUserId={this.state.selectedUserId}/>
					<ul id="user-list" className="list compactBoxList">
					</ul>
				</div>
			</div>
		);
	}
}