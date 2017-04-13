import React from 'react';
import ProjectEndpoint from '../../common/endpoints/ProjectEndpoint';
import CodesystemEndpoint from '../../common/endpoints/CodesystemEndpoint';
import UserEndpoint from '../../common/endpoints/UserEndpoint';

import 'script!../../../../components/bootstrap/bootstrap.min.js'

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


	getStyles() {
		return {
			pagination: {
				listStyle: "none",
				display: "flex"
			},
			paginationItem: {
				color: "black",
				float: "left",
				padding: "8px 16px",
				textDecoration: "none",
				cursor: "pointer"

			}
		};
	}

	acceptInvitation(notification) {
		var _this = this;
		ProjectEndpoint.addOwner(notification.project).then(function (resp) {
			_this.props.projectList.addProject(resp);
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
		const styles = this.getStyles();

		switch (notification.type) {
		case "INVITATION":
			if (notification.settled) {
				return <a className=" fa-lg" style={{color:"green", float:"right", marginTop:"-15px"}}>
							<i  className="fa fa-check fa-2x "></i>
						</a>
			} else {
				return <div style={{float:"right", marginTop:"-22px"}}>
						<a className=" btn  fa-stack fa-lg" onClick={() => this.settleNotification(notification)}>
							<i className="fa fa-circle fa-stack-2x fa-cancel-btn-circle fa-hover"></i>
							<i className="fa fa-times fa-stack-1x fa-inverse fa-cancel-btn"></i>
						</a>
						<a className=" btn  fa-stack fa-lg notificationAccept"  onClick={() => this.acceptInvitation(notification)}>
							<i className="fa fa-circle fa-stack-2x fa-editor-btn-circle fa-hover"></i>
							<i className="fa fa-check fa-stack-1x fa-inverse fa-editor-btn"></i>
						</a>
					</div>
			}
			break;
		case "VALIDATION_REQUEST":
			if (notification.settled) {
				return <a className=" fa-lg" style={{color:"green", float:"right", marginTop:"-15px"}}>
							<i  className="fa fa-check fa-2x "></i>
						</a>
			} else {
				return <div style={{float:"right", marginTop:"-22px"}}>
						<a className=" btn  fa-stack fa-lg" onClick={() => this.settleNotification(notification)}>
							<i className="fa fa-circle fa-stack-2x fa-cancel-btn-circle fa-hover"></i>
							<i className="fa fa-times fa-stack-1x fa-inverse fa-cancel-btn"></i>
						</a>
						<a className=" btn  fa-stack fa-lg notificationAccept"  onClick={() => this.createValidationProject(notification)}>
							<i className="fa fa-circle fa-stack-2x fa-editor-btn-circle fa-hover"></i>
							<i className="fa fa-check fa-stack-1x fa-inverse fa-editor-btn"></i>
						</a>
					</div>
			}
			break;
		case "POSTED_VALIDATION_REQUEST":
			return <a className=" fa-lg" style={{color:"grey", float:"right", marginTop:"-20px"}} >
						<i  className="fa fa-key fa-2x "></i>
					</a>
			break;
		case "VALIDATION_REQUEST_GRANTED":
			return <a className=" fa-lg" style={{color:"green", float:"right", marginTop:"-20px"}}>
						<i  className="fa fa-key fa-2x "></i>
					</a>
			break;
		default:
			return "";
			break;
		}
	}

	render() {
		var _this = this;

		const styles = this.getStyles();

		const lastItem = this.state.currentPage * this.state.itemsPerPage;
		const firstItem = lastItem - this.state.itemsPerPage;
		const itemsToDisplay = this.state.notifications.slice(firstItem, lastItem);

		const renderListItems = itemsToDisplay.map((notification, index) => {
			return <li 
					key={notification.id} 
				>
					<span dangerouslySetInnerHTML={{__html: notification.subject}}></span>
					<br/>
					<span dangerouslySetInnerHTML={{__html: notification.message}}></span>
					{this.renderButtons(notification)}
				</li>;
		});

		//Render Pagination
		const pageNumbers = [];
		for (let i = 1; i <= Math.ceil(this.state.notifications.length / this.state.itemsPerPage); i++) {
			pageNumbers.push(i);
		}
		const renderPagination = pageNumbers.map(pageNo => {
			return (
				<a
	              key={pageNo}
	              id={pageNo}
	              onClick={this.paginationClick}
	              style={styles.paginationItem}
	              className= {this.isActivePage(pageNo)}
	            >
	              {pageNo}
	            </a>
			);
		});

		return (
			<div>
				<ul className="list compactBoxList">
					{renderListItems}
	            </ul>
	            <ul className="pagination" style={styles.pagination}>
					{renderPagination}
            	</ul>
     		</div>
		);
	}


}