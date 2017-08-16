import React from 'react';
import styled from 'styled-components';

import ProjectEndpoint from '../../common/endpoints/ProjectEndpoint';
import CodesystemEndpoint from '../../common/endpoints/CodesystemEndpoint';
import UserEndpoint from '../../common/endpoints/UserEndpoint';
import {
	StyledPagination,
	StyledPaginationItem,
	StyledBoxList,
	StyledListItemDefault
} from '../../common/styles/List';

const StyledNotificationInfo = styled.div `
	flex-grow: 1;
`;

const StyledActionBtns = styled.div `
	display: flex;
	flex-direction: column;
`;

const StyledGreenIcon = styled.a `
	color: green;
`;

const StyledGreyIcon = styled.a `
	color: grey;
`;

export default class NotificationList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			notifications: [],
			// pagination
			currentPage: 1,
			itemsPerPage: 8,
			search: ''
		};

		this.init();

		this.paginationClick = this.paginationClick.bind(this);
		this.acceptInvitation = this.acceptInvitation.bind(this);
		this.settleNotification = this.settleNotification.bind(this);
		this.createValidationProject = this.createValidationProject.bind(this);

	}

	init() {
		var _this = this;
		_this.state.notifications = [];
		UserEndpoint.listUserNotification().then(function (resp) {
			var items = resp.items || [];
			items = _this.sortNotifications(items);
			_this.setState({
				notifications: items
			});
		});
	}

	// TODO possibly sort
	sortNotifications(notifications) {
		notifications.sort(function (a, b) {
			if (a.datetime > b.datetime) return -1;
			if (a.datetime < b.datetime) return 1;
			return 0;
		});
		return notifications;
	}

	paginationClick(event) {
		this.setState({
			currentPage: Number(event.target.id)
		});
	}

	acceptInvitation(notification) {
		var _this = this;
		ProjectEndpoint.addOwner(notification.project).then(function (resp) {
			_this.props.addProject(resp);
		});

		this.settleNotification(notification);
	}

	createValidationProject(notification) {

		ProjectEndpoint.createValidationProject(notification.project, notification.originUser).then(function (resp) {});

		this.settleNotification(notification);
	}

	isActivePage(page) {
		return ((page == this.state.currentPage) ? 'active' : ' ');
	}

	isValidationProject(project) {
		return 'clickable ' + ((project.type == "VALIDATION") ? 'validationProjectItem' : ' ');
	}

	settleNotification(notification) {
		var _this = this;
		notification.settled = true;
		UserEndpoint.updateUserNotification(notification).then(function (resp) {
			_this.setState({
				notifications: _this.state.notifications
			});
		});
	}

	renderButtons(notification) {
		switch (notification.type) {
		case "INVITATION":
			if (notification.settled) {
				return <StyledGreenIcon className=" fa-lg">
							<i  className="fa fa-check fa-2x "></i>
						</StyledGreenIcon>
			} else {
				return <StyledActionBtns>
						<a className=" btn  fa-stack fa-lg" onClick={() => this.settleNotification(notification)}>
							<i className="fa fa-circle fa-stack-2x fa-cancel-btn-circle fa-hover"></i>
							<i className="fa fa-times fa-stack-1x fa-inverse fa-cancel-btn"></i>
						</a>
						<a className=" btn  fa-stack fa-lg notificationAccept"  onClick={() => this.acceptInvitation(notification)}>
							<i className="fa fa-circle fa-stack-2x fa-editor-btn-circle fa-hover"></i>
							<i className="fa fa-check fa-stack-1x fa-inverse fa-editor-btn"></i>
						</a>
					</StyledActionBtns>
			}
			break;
		case "VALIDATION_REQUEST":
			if (notification.settled) {
				return <StyledGreenIcon className=" fa-lg">
							<i  className="fa fa-check fa-2x "></i>
						</StyledGreenIcon>
			} else {
				return <StyledActionBtns>
						<a className=" btn  fa-stack fa-lg" onClick={() => this.settleNotification(notification)}>
							<i className="fa fa-circle fa-stack-2x fa-cancel-btn-circle fa-hover"></i>
							<i className="fa fa-times fa-stack-1x fa-inverse fa-cancel-btn"></i>
						</a>
						<a className=" btn  fa-stack fa-lg notificationAccept"  onClick={() => this.createValidationProject(notification)}>
							<i className="fa fa-circle fa-stack-2x fa-editor-btn-circle fa-hover"></i>
							<i className="fa fa-check fa-stack-1x fa-inverse fa-editor-btn"></i>
						</a>
					</StyledActionBtns>
			}
			break;
		case "POSTED_VALIDATION_REQUEST":
			return <StyledGreyIcon className=" fa-lg">
						<i  className="fa fa-key fa-2x "></i>
					</StyledGreyIcon>
			break;
		case "VALIDATION_REQUEST_GRANTED":
			return <StyledGreenIcon className=" fa-lg">
						<i  className="fa fa-key fa-2x "></i>
					</StyledGreenIcon>
			break;
		default:
			return "";
			break;
		}
	}

	render() {
		var _this = this;

		const lastItem = this.state.currentPage * this.state.itemsPerPage;
		const firstItem = lastItem - this.state.itemsPerPage;
		const itemsToDisplay = this.state.notifications.slice(firstItem, lastItem);

		const renderListItems = itemsToDisplay.map((notification, index) => {
			return <StyledListItemDefault
					key={notification.id}
				>
					<StyledNotificationInfo>
						<span dangerouslySetInnerHTML={{__html: notification.subject}}></span>
						<br/>
						<span dangerouslySetInnerHTML={{__html: notification.message}}></span>
					</StyledNotificationInfo>
					{this.renderButtons(notification)}
				</StyledListItemDefault>;
		});

		//Render Pagination
		const pageNumbers = [];
		for (let i = 1; i <= Math.ceil(this.state.notifications.length / this.state.itemsPerPage); i++) {
			pageNumbers.push(i);
		}
		const renderPagination = pageNumbers.map(pageNo => {
			return (
				<StyledPaginationItem
	              key={pageNo}
	              id={pageNo}
	              onClick={this.paginationClick}
	              className= {this.isActivePage(pageNo)}
	            >
	              {pageNo}
			  </StyledPaginationItem>
			);
		});

		return (
			<div>
				<StyledBoxList>
					{renderListItems}
	            </StyledBoxList>
	            <StyledPagination className="pagination">
					{renderPagination}
            	</StyledPagination>
     		</div>
		);
	}


}