//@ts-check
import React, { Component } from 'react';

import { FormattedMessage } from 'react-intl';

import styled from 'styled-components';
import {
	ItemList,
	StyledListItemDefault,
	StyledListItemPrimary
} from '../../common/styles/ItemList.jsx';

import UserGroupEndpoint from '../../common/endpoints/UserGroupEndpoint.js';

export default class GroupUserList extends Component {
	constructor(props) {
		super(props);

		this.state = {
			users: []
		};

		this.renderUser = this.renderUser.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		this.collectUsers(nextProps.userGroup.id);
	}

	async collectUsers(userGroupId) {
		const resp = await UserGroupEndpoint.getUsers(userGroupId);
		this.setState({
			users: this.sortUsers(resp.items || [])
		});
	}

	sortUsers(userList) {
		userList.sort(function(a, b) {
			if (a.givenName < b.givenName) return -1;
			if (a.givenName > b.givenName) return 1;
			return 0;
		});
		return userList;
	}

	isUserOwner(user) {
		return this.props.userGroup.owners.includes(user.id);
	}

	renderUser(user, inde) {
		if (this.isUserOwner(user)) {
			return (
				<StyledListItemDefault key={user.id}>
					{user.givenName + ' ' + user.surName}
				</StyledListItemDefault>
			);
		} else {
			return (
				<StyledListItemPrimary key={user.id}>
					{user.givenName + ' ' + user.surName}
				</StyledListItemPrimary>
			);
		}
	}

	renderUsers() {
		return (
			<ItemList
				key={'itemlist'}
				hasPagination={true}
				itemsPerPage={8}
				items={this.state.users}
				renderItem={this.renderUser}
			/>
		);
	}

	render() {
		return (
			<div className="box-body">{this.renderUsers()}</div>
		);
	}
}
