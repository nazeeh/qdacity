import React from 'react';

import UserEndpoint from '../../../common/endpoints/UserEndpoint';

import {
	ItemList,
	ListMenu,
	StyledListItemBtn,
	StyledListItemPrimary,
	StyledListItemDefault
} from '../../../common/styles/ItemList.jsx';

export default class UserList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			users: []
		};

		this.init();

		this.renderUser = this.renderUser.bind(this);
	}

	init() {
		this.addOwners();
	}

	addOwners() {
		var _this = this;
		UserEndpoint.listUserByCourse(this.props.course.id).then(function(resp) {
			resp.items = resp.items || [];
			_this.setState({
				users: resp.items
			});
		});
	}

	renderUser(user, index) {
		return (
			<StyledListItemDefault key={index} className="clickable">
				<span> {user.givenName + ' ' + user.surName} </span>
			</StyledListItemDefault>
		);
	}

	render() {
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
}
