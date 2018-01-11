import React from 'react';

import UserEndpoint from '../../../common/endpoints/UserEndpoint';

import {
	ItemList,
	ListMenu,
	StyledListItemBtn,
	StyledListItemPrimary,
	StyledListItemDefault,
} from '../../../common/styles/ItemList.jsx';

export default class UserList extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			users: []
		};

		this.renderUser = this.renderUser.bind(this);

		this.init();
	}

	init() {

		switch (this.props.project.getType()) {
		case "VALIDATION":
			this.addValidationCoders();
			break;
		case "PROJECT":
			this.addOwners();
			break;
		default:
			break;

		}
	}

	addOwners() {
		var _this = this;
		UserEndpoint.listUser(this.props.project.getId()).then(function (resp) {
			resp.items = resp.items || [];
			_this.setState({
				users: resp.items
			});
		});
	}

	addValidationCoders() {
		var _this = this;
		UserEndpoint.listValidationCoders(this.props.project.getId()).then(function (resp) {
			resp.items = resp.items || [];
			_this.setState({
				users: resp.items
			});
		});
	}

	renderUser(user, index) {
		return (
			<StyledListItemDefault key={index} className="clickable">
                <span > {user.givenName + " " + user.surName} </span>
            </StyledListItemDefault>
		);
	}

	render() {
		return (
			<ItemList 
                key={"itemlist"}
                hasPagination={true}
                itemsPerPage={8}
                items={this.state.users} 
                renderItem={this.renderUser} />
		);
	}
}