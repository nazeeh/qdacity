import React from 'react';

import UserListCtrl from './UserListCtrl.jsx';
import UserEndpoint from '../../common/endpoints/UserEndpoint';
import {StyledListItemDefault} from "../../common/styles/List";

const StyledListItemUser = StyledListItemDefault.extend `
	&:hover {
		cursor: pointer;	
	}
`;
export default class UserList extends React.Component {
	constructor(props) {
		super(props);
		this.selectUser = this.selectUser.bind(this);
		this.updateUser = this.updateUser.bind(this);

	}


	updateUser(basicInfo) {
		const _this = this;
		var user = this.getActiveUser();
		user.givenName = basicInfo.firstName;
		user.surName = basicInfo.lastName;
		user.email = basicInfo.email;
		user.type = basicInfo.type;

		UserEndpoint.updateUser(user).then(function (resp) {
			_this.forceUpdate();
		});
	}

	selectUser(selectedID) {
		this.props.setSelectedUserId(selectedID)
	}

	getActiveUser() {
		return this.getUser(this.props.selectedUserId);
	}

	getUser(userId) {
		var _this = this;
		var selectedUser = this.props.users.find(function (user) {
			return user.id == userId;
		});
		return selectedUser;
	}

	isActive(value) {
		return 'list-group-item ' + ((value === this.props.selectedUserId) ? 'active' : 'default');
	}


	render() {
		var _this = this;
		var activeUser = this.getActiveUser();
		return (


			<div className="list-group">
				{
					this.props.selectedUserId && <UserListCtrl user={activeUser} updateUser={this.updateUser} removeUser={this.props.removeUser}
								  test={1}/>
				}
				{
					this.props.users.map(function (user) {
						return <StyledListItemUser className={_this.isActive(user.id)} key={user.id} href={"#"}
												   onClick={_this.selectUser.bind(null, user.id)}><span>{user.givenName} {user.surName}</span><span
							className="pull-right"><em>{user.email}</em></span></StyledListItemUser>
					})
				}
			</div>
		);
	}


}