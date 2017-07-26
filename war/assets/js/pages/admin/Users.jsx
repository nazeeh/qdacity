import React from 'react'
import UserList from './UserList.jsx';

import UserEndpoint from '../../common/endpoints/UserEndpoint';

export default class Users extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			users: [],
			search: ''
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

	render(){
		return(
			<div className="box box-default">
				<div className="box-header with-border">
					<h3 className="box-title">Users</h3>
				</div>
				<div className="box-body">
					<div className="projectlist-menu">
						<span className="searchfield" id="searchform">
							<input
								type="text"
								className="search"
								placeholder="Search"
								value={this.state.search}
								onChange={this.updateSearch}
							/>
							<button id="userSearchFindBtn" type="button" id="search" onClick={this.findUsers}>Find!</button>
						</span>
					</div>
					<UserList  users={this.state.users} removeUser={this.removeUser}/>
					<ul id="user-list" className="list compactBoxList">
					</ul>
					<ul className="pagination"></ul>
				</div>
			</div>
		);
	}
}