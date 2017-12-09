import React from 'react';
import styled from 'styled-components';


import CourseEndpoint from 'endpoints/CourseEndpoint';
import TermCourseList from './TermCourseList.jsx';
import Course from './Course';
import 'script-loader!../../../../components/URIjs/URI.min.js';
import 'script-loader!../../../../components/alertify/alertify-0.3.js';
import Teachers from "./Teachers/Teachers.jsx";
import TitleRow from "./TitleRow/TitleRow.jsx"

import UnauthenticatedUserPanel from "../../common/UnauthenticatedUserPanel.jsx";

const StyledDashboard = styled.div `
	margin-top: 70px;
	margin-left: auto;
	margin-right: auto;
	width: 1170px;
	display: grid;
    grid-template-columns: 6fr 6fr;
    grid-template-areas:
				"titlerow titlerow"
        "terms teachers";
	grid-column-gap: 20px;
`;

const StyledTitleRow = styled.div `
    grid-area: titlerow;
`;

export default class CourseDashboard extends React.Component {
	constructor(props) {
		super(props);


		var urlParams = URI(window.location.search).query(true);

		var course = new Course(urlParams.course);
		this.setCourse = this.setCourse.bind(this);
		this.addParticipant = this.addParticipant.bind(this);
		this.removeParticipant = this.removeParticipant.bind(this);

		this.state = {
			course: course,
			isCourseOwner: false,
			isSignedIn: false,
			isRegistered: false
		};
		$("body").css({
			overflow: "auto"
		});

		const _this = this;
		this.props.account.addAuthStateListener(function() {
			// update on every auth state change
			_this.updateUserStatus();
		});
		
		// update on initialization
		this.updateUserStatus();
	}

	setCourse(course) {
		this.setState({
			course: course
		});
	}

	addParticipant(term) {
		//Find the id of the term to be added, then add the user to participants & set isUserParticipant to true for that term
		var _this = this;
		var id = term.id;
		var course = this.state.course;
		_this.props.account.getCurrentUser().then(function (resp) {
			term.participants.push(resp.id);
			term.isUserParticipant = true;
			_this.setState({
				course: course
			});
		});
	}

	removeParticipant(term) {
		//Find the id of the term to be removed, then remove the user from participants & set isUserParticipant to false for that term
		var _this = this;
		var id = term.id;
		var course = this.state.course;
		term.participants.splice(term.participants.indexOf(term.id), 1);
		term.isUserParticipant = false;
		_this.setState({
			course: course
		});
	}



	init() {
		if (!this.userPromise) {
			this.userPromise = this.props.account.getCurrentUser();
			this.setUserRights();
		}
	}

	setUserRights() {
		var _this = this;
		this.userPromise.then(function (user) {
			var isCourseOwner = _this.props.account.isCourseOwner(user, _this.state.course.getId());
			_this.setState({
				isCourseOwner: isCourseOwner
			});
		});
	}
	
	updateUserStatus() {
		const _this = this;
		const loginStatus = this.props.account.isSignedIn();
		if(loginStatus !== this.state.isSignedIn) {
			this.state.isSignedIn = loginStatus;
			this.props.account.getCurrentUser().then(function(user) {
				_this.state.isRegistered = !!user;
				_this.setState(_this.state); 
			})
		}
	}


	render() {
		if (!this.state.isSignedIn || !this.state.isRegistered) return (<UnauthenticatedUserPanel account={this.props.account} history={this.props.history}/>);

		return (
			<StyledDashboard>
			<StyledTitleRow><TitleRow course={this.state.course}/></StyledTitleRow>
				<div>
					<div className="box box-default">
						<div className="box-header with-border">
							<h3 className="box-title">Terms</h3>
						</div>
						<div className="box-body">
							<TermCourseList account={this.props.account} addParticipant={this.addParticipant} removeParticipant={this.removeParticipant} course={this.state.course} setCourse={this.setCourse} history={this.props.history}/>
						</div>
					</div>
				</div>
				<div>
						<Teachers course={this.state.course} isCourseOwner={this.state.isCourseOwner}/>
				</div>
		  	</StyledDashboard>
		);
	}
}