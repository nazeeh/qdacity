//@ts-check
import React, { Component } from 'react';

import IntlProvider from '../../common/Localization/LocalizationProvider';
import { FormattedMessage } from 'react-intl';
import Theme from '../../common/styles/Theme.js';

import UserGropuEndpoint from '../../common/endpoints/UserGroupEndpoint.js';

import styled from 'styled-components';
import {
	ItemList,
	StyledListItemBtn,
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

	removeUser(e, user, index) {
		const { formatMessage } = IntlProvider.intl;
		const _this = this;
		UserGropuEndpoint.removeUser(this.props.userGroup.id, user.id)
			.then(function(resp) {
				alertify.success(
					formatMessage(
						{
							id: 'group.removeUser.success',
							defaultMessage: '{email} has been removed from the group'
						},
						{
							email: user.email
						}
					)
				);
				_this.collectUsers(_this.props.userGroup.id);
			})
			.catch(function(resp) {
				alertify.error(
					formatMessage(
						{
							id: 'group.removeUser.failure',
							defaultMessage: 'Could not remove {email} from the group'
						},
						{
							email: user.email
						}
					)
				);
				_this.collectUsers(this.props.userGroup.id);
			});
	}

	renderUserButtons(user, index) {
		if(this.props.isOwner) {
			return (
				<StyledListItemBtn
					onClick={e => this.removeUser(e, user, index)}
					className=" btn fa-lg"
					color={Theme.rubyRed}
					colorAccent={Theme.rubyRedAccent}
					>
					<i className="fa fa-trash " />
				</StyledListItemBtn>
			);
		} else {
			return null;
		}
		
	}

	renderUser(user, index) {
		if (this.isUserOwner(user)) {
			return (
				<StyledListItemDefault key={user.id}>
					<span>
						{user.givenName + ' ' + user.surName}
					</span>
					{this.renderUserButtons(user, index)}
				</StyledListItemDefault>
			);
		} else {
			return (
				<StyledListItemPrimary key={user.id}>
					<span>
						{user.givenName + ' ' + user.surName}
					</span>
					{this.renderUserButtons(user, index)}
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
