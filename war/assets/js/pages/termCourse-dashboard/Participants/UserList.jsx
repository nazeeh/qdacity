import React from 'react';

import CourseEndpoint from '../../../common/endpoints/CourseEndpoint';

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
			users: [],
			// pagination
			currentPage: 1,
			itemsPerPage: 5
		};

		this.init();

		this.renderUser = this.renderUser.bind(this);
	}

	init() {
		this.addOwners();
	}

	addOwners() {
		var _this = this;
		CourseEndpoint.listTermCourseParticipants(this.props.termCourse.id).then(
			function(resp) {
				resp.items = resp.items || [];
				_this.setState({
					users: resp.items
				});
			}
		);
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
